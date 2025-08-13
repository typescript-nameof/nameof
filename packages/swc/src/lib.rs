use std::sync::Arc;

use anyhow::Error;
use swc::Compiler;
use swc_compiler_base::IdentCollector;
use swc_core::{
    common::{pass::Either, FileName, SourceMap, Span, Spanned, SyntaxContext},
    ecma::{
        ast::{
            ArrowExpr, BlockStmt, BlockStmtOrExpr, CallExpr, Callee, ComputedPropName, Expr,
            ExprOrSpread, FnExpr, Ident, IdentName, Lit, MemberExpr, MemberProp, ParenExpr,
            Program, ReturnStmt, TsAsExpr, TsEntityName, TsImportType, TsIndexedAccessType,
            TsNonNullExpr, TsParenthesizedType, TsType, TsTypeQuery, TsTypeQueryExpr, TsTypeRef,
        },
        visit::{visit_mut_pass, VisitMut, VisitMutWith, VisitWith},
    },
    plugin::{errors::HANDLER, plugin_transform, proxies::TransformPluginProgramMetadata},
};
use swc_ecma_codegen::Node;

/// Represents an unsupported node.
pub enum UnsupportedNode<'a> {
    /// Indicates an expression.
    Expr(&'a Expr),
    /// Indicates a type.
    Type(&'a TsType),
}

/// Represents an error which occurred while performing a `nameof`-substitution.
pub enum NameofError<'a> {
    /// Indicates an arbitrary error.
    Error(Span, Error),
    /// Indicates the unsupported use of spread arguments.
    Spread(&'a Span),
    /// Indicates an invalid number of arguments.
    ArgumentError(&'a CallExpr, usize, usize),
    /// Indicates the absence of a returned node in a function-like expression.
    NoReturnedNode(&'a Expr),
    /// Indicates the use of an invalid method on the `nameof` interface.
    InvalidMethod(&'a IdentName),
    /// Indicates the unsupported use of a computed property.
    UnsupportedComputation(&'a ComputedPropName),
    /// Indicates an unsupported node.
    UnsupportedNode(UnsupportedNode<'a>),
}

/// Represents either success or a [`NameofError`].
type NameofResult<'a, T> = Result<T, NameofError<'a>>;

/// Represents a node which contains a name.
enum NamedNode<'a> {
    /// Indicates an expression.
    Expr(&'a Expr),
    /// Indicates a type.
    Type(&'a TsType),
}

/// Represents the substitution of an expression with its name.
enum NameSubstitution<'a> {
    /// Indicates the substitution of the expression with the last part of its name.
    Tail(NamedNode<'a>),
}

/// Represents a method of the `nameof` interface.
pub enum NameofMethod {
    /// Indicates a method for yielding the full name of an object.
    Full,
    /// Indicates a method for injecting plain java into the result of a `Full` call.
    Interpolate,
    /// Indicates a method for determining the name of multiple objects.
    Array,
    /// Indicates a method for splitting the full name of an object into an array.
    Split,
}

/// Represents a `nameof` call expression.
enum NameofExpression<'a> {
    /// Indicates a normal function call.
    Normal {
        /// The [`CallExpr`] holding the `nameof` call.
        call: &'a mut CallExpr,
        /// The requested method.
        method: Option<NameofMethod>,
    },
    /// Indicates a typed property access.
    Typed(&'a Expr),
}

/// Provides the functionality to substitute [`NameofExpression`]s.
pub struct NameofVisitor {
    /// The context assigned to global variables.
    unresolved_context: SyntaxContext,
}

impl NameofVisitor {
    /// Checks whether the specified `ident` is the global `nameof` object.
    fn is_global_nameof(&self, ident: &Ident) -> bool {
        ident.sym == "nameof" && ident.ctxt == self.unresolved_context
    }

    /// Gets the `nameof` expression in the specified `node`.
    ///
    /// # Returns
    /// Either [`None`] if the underlying `node` is no `nameof` expression or
    /// a [`NameofResult`] holding either a [`NameofError`] or the [`NameofExpression`].
    fn get_nameof_expression<'a>(
        &self,
        node: &'a mut Expr,
    ) -> NameofResult<'a, Option<NameofExpression<'a>>> {
        match node {
            Expr::Call(call) => match call {
                CallExpr {
                    callee: Callee::Expr(callee),
                    ..
                } => Ok(Some(NameofExpression::Normal {
                    method: match &**callee {
                        Expr::Ident(ident) if self.is_global_nameof(ident) => None,
                        Expr::Member(MemberExpr {
                            obj,
                            prop: MemberProp::Ident(prop),
                            ..
                        }) => match &**obj {
                            Expr::Ident(ident) if self.is_global_nameof(ident) => {
                                Some(match prop.sym.as_str() {
                                    "full" => NameofMethod::Full,
                                    "interpolate" => NameofMethod::Interpolate,
                                    "array" => NameofMethod::Array,
                                    "split" => NameofMethod::Split,
                                    _ => {
                                        return Err(NameofError::InvalidMethod(
                                            call.callee
                                                .as_expr()
                                                .unwrap()
                                                .as_member()
                                                .unwrap()
                                                .prop
                                                .as_ident()
                                                .unwrap(),
                                        ))
                                    }
                                })
                            }
                            _ => return Ok(None),
                        },
                        _ => return Ok(None),
                    },
                    call,
                })),
                _ => Ok(None),
            },
            Expr::Member(member) => Ok(match self.get_nameof_expression(&mut member.obj) {
                Err(NameofError::InvalidMethod(ident)) if ident.sym == "typed" => {
                    Some(NameofExpression::Typed(node))
                }
                _ => None,
            }),
            _ => Ok(None),
        }
    }

    /// Gets the name substitution represented by the specified `node`.
    fn get_name_substitution<'a>(
        &self,
        node: &'a mut Expr,
    ) -> NameofResult<'a, Option<NameSubstitution<'a>>> {
        Ok(match self.get_nameof_expression(node)? {
            Some(expr) => Some(match expr {
                NameofExpression::Typed(member) => NameSubstitution::Tail(NamedNode::Expr(member)),
                NameofExpression::Normal { call, method: None } => {
                    let node = match (
                        call.type_args.as_ref().map(|t| t.params.len()).unwrap_or(0),
                        call.args.len(),
                    ) {
                        (0 | 1, 1) => {
                            let expr_or_body = match call.args[0] {
                                ExprOrSpread { spread: None, .. } => match &*call.args[0].expr {
                                    Expr::Arrow(ArrowExpr { body, .. }) => match &**body {
                                        BlockStmtOrExpr::Expr(expr) => Either::Left(&**expr),
                                        BlockStmtOrExpr::BlockStmt(body) => {
                                            Either::Right(Some(body))
                                        }
                                    },
                                    Expr::Fn(FnExpr { function, .. }) => {
                                        Either::Right(function.body.as_ref())
                                    }
                                    expr => Either::Left(expr),
                                },
                                ExprOrSpread {
                                    spread: Some(_), ..
                                } => {
                                    return Err(NameofError::Spread(
                                        call.args[0].spread.as_ref().unwrap(),
                                    ))
                                }
                            };

                            NamedNode::Expr(match expr_or_body {
                                Either::Left(expr) => expr,
                                Either::Right(body) => {
                                    match body.map(|b| Self::get_returned_expression(b)).flatten() {
                                        Some(expr) => expr,
                                        None => {
                                            return Err(NameofError::NoReturnedNode(
                                                &call.args[0].expr,
                                            ))
                                        }
                                    }
                                }
                            })
                        }
                        (1, 0) => NamedNode::Type(&*call.type_args.as_ref().unwrap().params[0]),
                        (type_arg_count, arg_count) => {
                            return Err(NameofError::ArgumentError(call, type_arg_count, arg_count))
                        }
                    };

                    NameSubstitution::Tail(node)
                }
                _ => return Ok(None),
            }),
            None => None,
        })
    }

    /// Gets the replacement for the specified `node`.
    fn get_replacement<'a>(&self, node: &'a mut Expr) -> NameofResult<'a, Option<Expr>> {
        let substitution = self.get_name_substitution(node)?;

        match substitution {
            Some(NameSubstitution::Tail(expr)) => Ok(Some(Expr::Lit(Lit::from(match expr {
                NamedNode::Expr(expr) => get_name(expr)?,
                NamedNode::Type(ts_type) => get_type_name(ts_type)?,
            })))),
            None => Ok(None),
        }
    }

    /// Gets the expression returned from the specified `block`.
    fn get_returned_expression(block: &BlockStmt) -> Option<&Expr> {
        for statement in block.stmts.iter().rev() {
            if let Some(ReturnStmt {
                arg: Some(statement),
                ..
            }) = statement.as_return_stmt()
            {
                return Some(&statement);
            }
        }

        None
    }
}

impl VisitMut for NameofVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html
    fn visit_mut_expr(&mut self, node: &mut Expr) {
        let replacement = self.get_replacement(node);

        match replacement {
            Ok(Some(expr)) => *node = expr,
            _ => {
                if let Err(err) = replacement {
                    HANDLER.with(|handler| {
                        let (span, message) = match err {
                            NameofError::Error(span, error) => {
                                (span, format!("An error occurred: {error}"))
                            }
                            NameofError::Spread(span) => (*span, String::from("The spread operator is not supported.")),
                            NameofError::ArgumentError(call, type_arg_count, arg_count) => {
                                (
                                    call.span,
                                    format!(
                                        "Expected 1 argument or type argument but got {type_arg_count} type argument{} and {arg_count} argument{}.",
                                        if type_arg_count == 1 {""} else {"s"},
                                        if arg_count == 1 {""} else {"s"}
                                    )
                                )
                            }
                            NameofError::NoReturnedNode(expr) => (expr.span(), String::from("Missing returned expression.")),
                            NameofError::InvalidMethod(IdentName { sym: method, span }) => {
                                (*span, format!("The method `{method}` is not supported."))
                            }
                            NameofError::UnsupportedComputation(prop) => {
                                let expression = match print_node(&prop.expr) {
                                    Ok(code) => format!(" `{code}`"),
                                    Err(_) => String::from("")
                                };

                                (prop.expr.span(), format!("The specified expression{expression} is an invalid accessor type. Expected a string or a number."))
                            }
                            NameofError::UnsupportedNode(node) => {
                                let (span, code) = match node {
                                    UnsupportedNode::Expr(expr) => (expr.span(), print_node(expr)),
                                    UnsupportedNode::Type(ts_type) => (ts_type.span(), print_node(ts_type))
                                };

                                (span, format!("The specified expression{} is not supported.", if let Ok(code) = code {format!(" `{code}`")} else {"".into()}))
                            }
                        };

                        handler.struct_span_err(span, &message).emit();
                    })
                } else {
                    node.visit_mut_children_with(self);
                }
            }
        }
    }
}

/// Prints the source code represented by the specified `node`.
fn print_node<T>(node: &T) -> NameofResult<String>
where
    T: Node + VisitWith<IdentCollector>,
{
    let source_map: Arc<SourceMap> = Default::default();
    source_map.new_source_file(Arc::new(FileName::Anon), String::new());

    match Compiler::new(source_map).print(node, Default::default()) {
        Ok(output) => Ok(output.code),
        Err(error) => Err(NameofError::Error(node.span(), error)),
    }
}

/// Substitutes [`NameofExpression`]s in the specified `program`.
#[plugin_transform]
pub fn process_transform(program: Program, data: TransformPluginProgramMetadata) -> Program {
    program.apply(&mut visit_mut_pass(NameofVisitor {
        unresolved_context: SyntaxContext::empty().apply_mark(data.unresolved_mark),
    }))
}

/// Gets the name of the expression represented by the specified `expr`.
fn get_name<'a>(expr: &'a Expr) -> NameofResult<'a, String> {
    match expr {
        Expr::Paren(ParenExpr { expr, .. })
        | Expr::TsNonNull(TsNonNullExpr { expr, .. })
        | Expr::TsAs(TsAsExpr { expr, .. }) => get_name(expr),
        Expr::Ident(Ident { sym, .. }) => Ok(sym.to_string()),
        Expr::This(this) => Ok(print_node(this)?),
        Expr::Member(MemberExpr { prop, .. }) => Ok(match prop {
            MemberProp::Ident(ident) => ident.sym.to_string(),
            MemberProp::PrivateName(name) => print_node(name)?,
            MemberProp::Computed(prop) => match &*prop.expr {
                Expr::Lit(Lit::Str(str)) => str.value.to_string(),
                Expr::Lit(Lit::Num(num)) => num.value.to_string(),
                _ => return Err(NameofError::UnsupportedComputation(&prop)),
            },
        }),
        _ => Err(NameofError::UnsupportedNode(UnsupportedNode::Expr(expr))),
    }
}

/// Gets the name of the type represented by the specified `ts_type`.
fn get_type_name<'a>(ts_type: &'a TsType) -> NameofResult<'a, String> {
    match ts_type {
        TsType::TsIndexedAccessType(TsIndexedAccessType {
            index_type: ts_type,
            ..
        })
        | TsType::TsParenthesizedType(TsParenthesizedType {
            type_ann: ts_type, ..
        }) => get_type_name(&ts_type),
        TsType::TsKeywordType(keyword_type) => print_node(keyword_type),
        TsType::TsThisType(this_type) => print_node(this_type),
        TsType::TsImportType(TsImportType {
            qualifier: Some(type_name),
            ..
        })
        | TsType::TsTypeQuery(TsTypeQuery {
            expr_name:
                TsTypeQueryExpr::Import(TsImportType {
                    qualifier: Some(type_name),
                    ..
                })
                | TsTypeQueryExpr::TsEntityName(type_name),
            ..
        })
        | TsType::TsTypeRef(TsTypeRef { type_name, .. }) => match type_name {
            TsEntityName::Ident(ident) => Ok(ident.sym.as_str().into()),
            TsEntityName::TsQualifiedName(qualified_name) => {
                Ok(qualified_name.right.sym.as_str().into())
            }
        },
        _ => Err(NameofError::UnsupportedNode(UnsupportedNode::Type(ts_type))),
    }
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;

    use swc_core::{
        common::{Mark, SyntaxContext},
        ecma::{
            ast::Pass,
            transforms::{
                base::resolver,
                testing::{test_fixture, FixtureTestConfig},
            },
            visit::visit_mut_pass,
        },
    };
    use swc_ecma_lexer::Syntax;
    use testing::fixture;

    use crate::NameofVisitor;

    /// Initializes a new transformer running the [`NameofVisitor`].
    fn tr() -> impl Pass {
        let unresolved_mark = Mark::new();
        let top_level_mark = Mark::new();

        (
            resolver(unresolved_mark, top_level_mark, true),
            visit_mut_pass(NameofVisitor {
                unresolved_context: SyntaxContext::empty().apply_mark(unresolved_mark),
            }),
        )
    }

    #[fixture("tests/fixtures/**/input.[jt]s")]
    fn nameof_fixtures(input: PathBuf) {
        run_tests(input, false);
    }

    #[fixture("tests/errors/**/input.[jt]s")]
    fn nameof_errors(input: PathBuf) {
        run_tests(input, true);
    }

    fn run_tests(input: PathBuf, allow_error: bool) {
        let ext: String = input.extension().unwrap().to_string_lossy().into();

        test_fixture(
            match &ext[..] {
                "ts" => Syntax::Typescript(Default::default()),
                _ => Default::default(),
            },
            &|_| tr(),
            &input,
            &input.parent().unwrap().join(format!("output.{ext}")),
            FixtureTestConfig {
                allow_error,
                ..Default::default()
            },
        );
    }
}
