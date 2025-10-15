use std::iter;

use itertools::Itertools;
use swc_core::{
    common::{pass::Either, Spanned, SyntaxContext},
    ecma::{
        ast::{
            ArrayLit, ArrayPat, ArrowExpr, AssignPat, AssignPatProp, BindingIdent, BlockStmt,
            BlockStmtOrExpr, CallExpr, Callee, Expr, ExprOrSpread, FnExpr, Ident, IdentName,
            KeyValuePatProp, Lit, MemberExpr, MemberProp, ObjectPat, ObjectPatProp, Pat, Program,
            RestPat, ReturnStmt, TsType, UnaryExpr, UnaryOp,
        },
        visit::{visit_mut_pass, VisitMut, VisitMutWith},
    },
    plugin::{errors::HANDLER, plugin_transform, proxies::TransformPluginProgramMetadata},
};

use crate::{
    adapter::swc::{NameContext, NameSource, NamedExpr, NamedNode, NamedType, NodeSegment}, diagnostics::{NameofError, NameofResult, UnsupportedIndexer, UnsupportedNode}, serialization::{CollectOutput, CommonExpr, NameSubstitution, NameofExpression, NameofMethod}, transformation::{NameSegment, SegmentCollector, SegmentWalker}, utils::{print_node, unwrap_arg}
};

mod adapter;
mod diagnostics;
mod serialization;
mod transformation;
mod utils;

/// Provides the functionality to substitute [`NameofExpression`]s.
pub struct NameofVisitor {
    /// The context assigned to global variables.
    unresolved_context: SyntaxContext,
    /// The name of the `nameof` component.
    nameof_name: String,
}

impl NameofVisitor {
    /// Checks whether the specified `ident` is the global `nameof` object.
    fn is_global_nameof(&self, ident: &Ident) -> bool {
        ident.sym == self.nameof_name && ident.ctxt == self.unresolved_context
    }

    /// Transforms the specified `node` if it is a `nameof` expression.
    ///
    /// # Returns
    /// The result of the transformation.
    fn transform_nameof<'a>(&mut self, node: &'a mut Expr) -> NameofResult<'a, Option<Expr>> {
        let expr = self.get_nameof_expression(node)?;

        match expr {
            Some(expr) => Ok(Some(self.get_replacement(expr)?)),
            None => Ok(None),
        }
    }

    /// Gets the `nameof` expression in the specified `node`.
    ///
    /// # Returns
    /// Either [`None`] if the underlying `node` is no `nameof` expression or
    /// a [`NameofResult`] holding either a [`NameofError`] or the [`NameofExpression`].
    fn get_nameof_expression<'a>(
        &self,
        node: &'a Expr,
    ) -> NameofResult<'a, Option<NameofExpression<'a>>> {
        match node {
            Expr::Call(call) => match call {
                CallExpr {
                    callee: Callee::Expr(callee),
                    ..
                } => Ok(Some(NameofExpression::Common(CommonExpr {
                    local_contexts: vec![],
                    method: match &**callee {
                        Expr::Ident(ident) if self.is_global_nameof(ident) => None,
                        Expr::Member(MemberExpr {
                            obj,
                            prop: MemberProp::Ident(prop),
                            ..
                        }) => match &**obj {
                            Expr::Ident(ident) if self.is_global_nameof(ident) => {
                                Some(match prop.sym.as_str() {
                                    "full" => NameofMethod::Collect(CollectOutput::Full),
                                    "interpolate" => NameofMethod::Interpolate,
                                    "array" => NameofMethod::Array,
                                    "split" => NameofMethod::Collect(CollectOutput::Array),
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
                }))),
                _ => Ok(None),
            },
            Expr::Member(member) => Ok(match self.get_nameof_expression(&member.obj) {
                Err(NameofError::InvalidMethod(ident)) if ident.sym == "typed" => {
                    Some(NameofExpression::Typed(node))
                }
                _ => None,
            }),
            _ => Ok(None),
        }
    }

    /// Gets the [`SyntaxContext`]s holding the variables declared by the specified `params`.
    fn get_local_contexts(params: Vec<&Pat>) -> Vec<SyntaxContext> {
        params
            .iter()
            .flat_map(|p| {
                let pat = match p {
                    Pat::Assign(AssignPat { left: pat, .. })
                    | Pat::Rest(RestPat { arg: pat, .. }) => &**pat,
                    p => p,
                };

                match pat {
                    Pat::Ident(BindingIdent { id, .. }) => vec![id.ctxt],
                    Pat::Array(ArrayPat { elems, .. }) => {
                        Self::get_local_contexts(elems.iter().flatten().collect())
                    }
                    Pat::Object(ObjectPat { props, .. }) => props
                        .iter()
                        .flat_map(|p| match p {
                            ObjectPatProp::Assign(AssignPatProp {
                                key: BindingIdent { id, .. },
                                ..
                            }) => vec![id.ctxt],
                            ObjectPatProp::KeyValue(KeyValuePatProp { value: pat, .. })
                            | ObjectPatProp::Rest(RestPat { arg: pat, .. }) => {
                                Self::get_local_contexts(vec![pat])
                            }
                        })
                        .collect(),
                    _ => vec![],
                }
            })
            .collect()
    }

    /// Parses the arguments passed to a collecting `nameof` call such as [`NameofMethod::Full`] or [`NameofMethod::Split`].
    fn parse_collect_args<'a>(args: &'a [ExprOrSpread]) -> (Option<isize>, &'a [ExprOrSpread]) {
        if let [args @ .., ExprOrSpread { spread: None, expr }] = args {
            if let Some(index) = Self::parse_int(expr) {
                if index.fract() == 0.0 {
                    return (Some(index as isize), args);
                } else {
                    todo!("Report invalid start indexes")
                }
            }
        }

        (None, args)
    }

    /// Parses the number represented by the specified `expr`.
    fn parse_int(expr: &Expr) -> Option<f64> {
        Some(match expr {
            Expr::Lit(Lit::Num(num)) => num.value,
            Expr::Unary(UnaryExpr { op, arg, .. }) => {
                (match op {
                    UnaryOp::Plus => 1.0,
                    UnaryOp::Minus => -1.0,
                    _ => return None,
                }) * Self::parse_int(arg)?
            }
            _ => return None,
        })
    }

    /// Gets the name substitution represented by the specified `node`.
    fn get_name_substitution<'a>(
        &self,
        expr: NameofExpression<'a>,
    ) -> NameofResult<'a, NameSubstitution<'a>> {
        Ok(match expr {
            NameofExpression::Typed(member) => NameSubstitution::Tail(NamedNode::Expr(member)),
            NameofExpression::Common(CommonExpr {
                local_contexts,
                call,
                method,
            }) => match method {
                Some(method) => match method {
                    NameofMethod::Collect(format) => {
                        let (start_index, args) = Self::parse_collect_args(&call.args);

                        let NameContext {
                            node,
                            syntax_contexts,
                        } = Self::get_name_context(NameSource::Args(call, &args, &call.type_args))?;

                        NameSubstitution::Collect {
                            start_index,
                            local_contexts: [local_contexts, syntax_contexts].concat(),
                            output: format,
                            node,
                        }
                    }
                    NameofMethod::Array => {
                        let context = Self::get_name_context(NameSource::Call(call));

                        let (syntax_contexts, nodes): (
                            Vec<SyntaxContext>,
                            Box<dyn Iterator<Item = NameofResult<'a, NamedNode<'a>>>>,
                        ) = match context {
                            Err(_) => (
                                vec![],
                                if call.args.len() > 0 {
                                    Box::new(
                                        call.args
                                            .iter()
                                            .map(|arg| Ok(NamedNode::Expr(unwrap_arg(arg)?))),
                                    )
                                } else {
                                    Box::new(
                                        call.type_args
                                            .iter()
                                            .map(|a| &a.params)
                                            .flatten()
                                            .map(|p| Ok(NamedNode::Type(p))),
                                    )
                                },
                            ),
                            Ok(NameContext {
                                syntax_contexts,
                                node,
                            }) => (
                                syntax_contexts,
                                match node {
                                    NamedNode::Expr(expr) => {
                                        if let Expr::Array(array) = expr {
                                            Box::new(array.elems.iter().filter_map(|e| match e {
                                                Some(arg) => Some(
                                                    unwrap_arg(arg).map(|e| NamedNode::Expr(e)),
                                                ),
                                                None => None,
                                            }))
                                        } else {
                                            Box::new(iter::once(Ok(NamedNode::Expr(expr))))
                                        }
                                    }
                                    NamedNode::Type(ts_type) => {
                                        if let TsType::TsTupleType(tuple) = ts_type {
                                            Box::new(
                                                tuple
                                                    .elem_types
                                                    .iter()
                                                    .map(|t| Ok(NamedNode::Type(&t.ty))),
                                            )
                                        } else {
                                            Box::new(iter::once(Ok(NamedNode::Type(ts_type))))
                                        }
                                    }
                                },
                            ),
                        };

                        let nodes: Vec<NameofResult<NamedNode>> = nodes.collect();

                        NameSubstitution::Array {
                            local_contexts: [local_contexts, syntax_contexts].concat(),
                            nodes: nodes.into_iter().process_results(|nodes| nodes.collect())?,
                        }
                    }
                    NameofMethod::Interpolate => {
                        return Err(NameofError::UnusedInterpolation(&call));
                    }
                },
                None => {
                    NameSubstitution::Tail(Self::get_name_context(NameSource::Call(call))?.node)
                }
            },
        })
    }

    /// Gets the replacement for the specified `node`.
    fn get_replacement<'a>(&self, node: NameofExpression<'a>) -> NameofResult<'a, Expr> {
        let substitution = self.get_name_substitution(node)?;

        Ok(match substitution {
            NameSubstitution::Tail(expr) => Expr::Lit(Lit::from(match expr {
                NamedNode::Expr(expr) => {
                    NodeSegment::new(self, &vec![], NamedExpr::Expr(expr)).get_name()?
                }
                NamedNode::Type(ts_type) => {
                    NodeSegment::new(self, &vec![], NamedType::Type(ts_type)).get_name()?
                }
            })),
            NameSubstitution::Collect {
                start_index,
                local_contexts,
                output,
                node,
            } => {
                let walker: Box<dyn SegmentCollector> = match node {
                    NamedNode::Expr(expr) => Box::new(SegmentWalker {
                        start_index,
                        current: Some(NodeSegment::new(
                            self,
                            &local_contexts,
                            NamedExpr::Expr(expr),
                        )),
                    }),
                    NamedNode::Type(ts_type) => Box::new(SegmentWalker {
                        start_index,
                        current: Some(NodeSegment::new(
                            self,
                            &local_contexts,
                            NamedType::Type(ts_type),
                        )),
                    }),
                };

                match output {
                    CollectOutput::Array => Expr::Array(ArrayLit {
                        elems: walker
                            .split()?
                            .into_iter()
                            .map(|n| {
                                Some(ExprOrSpread {
                                    spread: None,
                                    expr: Box::new(Expr::Lit(Lit::from(n))),
                                })
                            })
                            .collect(),
                        ..Default::default()
                    }),
                    CollectOutput::Full => walker.full()?,
                }
            }
            NameSubstitution::Array {
                local_contexts,
                nodes,
            } => Expr::Array(ArrayLit {
                elems: nodes
                    .iter()
                    .map(|n| {
                        Ok(Some(ExprOrSpread {
                            expr: Box::new(match n {
                                NamedNode::Expr(expr) => match self.get_nameof_expression(expr) {
                                    Ok(Some(expr)) => self.get_replacement(match expr {
                                        NameofExpression::Common(expr) => {
                                            NameofExpression::Common(CommonExpr {
                                                local_contexts: [
                                                    expr.local_contexts,
                                                    local_contexts.clone(),
                                                ]
                                                .concat(),
                                                ..expr
                                            })
                                        }
                                        expr => expr,
                                    })?,
                                    _ => Expr::Lit(Lit::from(
                                        NodeSegment::new(
                                            self,
                                            &local_contexts,
                                            NamedExpr::Expr(expr),
                                        )
                                        .get_name()?,
                                    )),
                                },
                                NamedNode::Type(ts_type) => Expr::Lit(Lit::from(
                                    NodeSegment::new(
                                        self,
                                        &local_contexts,
                                        NamedType::Type(ts_type),
                                    )
                                    .get_name()?,
                                )),
                            }),
                            spread: None,
                        }))
                    })
                    .process_results(|n| n.collect())?,
                ..Default::default()
            }),
        })
    }

    /// Gets the context of the named node held by the specified [`NameSource`].
    fn get_name_context<'a>(source: NameSource<'a>) -> NameofResult<'a, NameContext<'a>> {
        Ok(match source {
            NameSource::Call(call) => {
                Self::get_name_context(NameSource::Args(&call, &call.args, &call.type_args))?
            }
            NameSource::Args(call, args, type_args) => {
                match (
                    type_args.as_ref().map(|t| t.params.len()).unwrap_or(0),
                    args.len(),
                ) {
                    (0 | 1, 1) => Self::get_name_context(NameSource::Param(&args[0]))?,
                    (1, 0) => Self::get_name_context(NameSource::Type(
                        &*type_args.as_ref().unwrap().params[0],
                    ))?,
                    (type_arg_count, arg_count) => {
                        return Err(NameofError::ArgumentError(call, type_arg_count, arg_count))
                    }
                }
            }
            NameSource::Param(param) => {
                Self::get_name_context(NameSource::Expr(unwrap_arg(param)?))?
            }
            NameSource::Expr(expr) => {
                let (expr_or_body, local_contexts) = match expr {
                    Expr::Arrow(ArrowExpr { body, params, .. }) => (
                        match &**body {
                            BlockStmtOrExpr::Expr(expr) => Either::Left(&**expr),
                            BlockStmtOrExpr::BlockStmt(body) => Either::Right(Some(body)),
                        },
                        Self::get_local_contexts(params.iter().collect()),
                    ),
                    Expr::Fn(FnExpr { function, .. }) => (
                        Either::Right(function.body.as_ref()),
                        Self::get_local_contexts(function.params.iter().map(|p| &p.pat).collect()),
                    ),
                    expr => (Either::Left(expr), vec![]),
                };

                NameContext {
                    syntax_contexts: local_contexts,
                    node: NamedNode::Expr(match expr_or_body {
                        Either::Left(expr) => expr,
                        Either::Right(body) => {
                            match body.map(|b| Self::get_returned_expression(b)).flatten() {
                                Some(expr) => expr,
                                None => return Err(NameofError::NoReturnedNode(expr)),
                            }
                        }
                    }),
                }
            }
            NameSource::Type(ts_type) => NameContext {
                node: NamedNode::Type(ts_type),
                syntax_contexts: vec![],
            },
        })
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
        let replacement = self.transform_nameof(node);

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
                            NameofError::UnsupportedIndexer(prop) => {
                                let (span, code) = match prop {
                                    UnsupportedIndexer::Prop(prop) => (prop.expr.span(), print_node(&prop.expr)),
                                    UnsupportedIndexer::Type(ts_type) => (ts_type.span(), print_node(ts_type))
                                };

                                let expression = match code {
                                    Ok(code) => format!(" `{code}`"),
                                    Err(_) => String::from("")
                                };

                                (span, format!("The specified expression{expression} is an invalid accessor type. Expected a string or a number."))
                            }
                            NameofError::MissingAccessor(span, name) => {
                                (span, format!("Missing a property accessor to the local variable `{}`.", name))
                            }
                            NameofError::UnsupportedNode(node) => {
                                let (span, code) = match node {
                                    UnsupportedNode::Expr(expr) => (expr.span(), print_node(expr)),
                                    UnsupportedNode::Type(ts_type) => (ts_type.span(), print_node(ts_type))
                                };

                                (span, format!("The specified expression{} is not supported.", if let Ok(code) = code {format!(" `{code}`")} else {"".into()}))
                            }
                            NameofError::UnsupportedInterpolation(call) => {
                                (call.span, "Interpolations are not supported here.".into())
                            }
                            NameofError::UnusedInterpolation(call) => {
                                (call.span, format!("Unused interpolation call. Interpolation calls must be used within `{}.full` calls.", self.nameof_name))
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

/// Substitutes [`NameofExpression`]s in the specified `program`.
#[plugin_transform]
pub fn process_transform(program: Program, data: TransformPluginProgramMetadata) -> Program {
    program.apply(&mut visit_mut_pass(NameofVisitor {
        unresolved_context: SyntaxContext::empty().apply_mark(data.unresolved_mark),
        nameof_name: "nameof".into(),
    }))
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
                nameof_name: "nameof".into(),
            }),
        )
    }

    #[fixture("tests/fixtures/**/input.[jt]s")]
    #[fixture("tests/fixtures/**/input.[m][jt]s")]
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
