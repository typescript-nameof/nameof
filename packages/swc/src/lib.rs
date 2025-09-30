use std::sync::Arc;

use anyhow::Error;
use swc::Compiler;
use swc_compiler_base::IdentCollector;
use swc_core::{
    common::{pass::Either, FileName, SourceMap, Span, Spanned, SyntaxContext},
    ecma::{
        ast::{
            ArrayLit, ArrayPat, ArrowExpr, AssignPat, AssignPatProp, BindingIdent, BlockStmt,
            BlockStmtOrExpr, CallExpr, Callee, ComputedPropName, Expr, ExprOrSpread, FnExpr, Ident,
            IdentName, KeyValuePatProp, Lit, MemberExpr, MemberProp, ObjectPat, ObjectPatProp,
            OptChainBase, OptChainExpr, ParenExpr, Pat, PrivateName, Program, RestPat, ReturnStmt,
            Super, SuperProp, SuperPropExpr, Tpl, TplElement, TsAsExpr, TsEntityName, TsImportType,
            TsIndexedAccessType, TsLit, TsLitType, TsNonNullExpr, TsParenthesizedType,
            TsQualifiedName, TsType, TsTypeParamInstantiation, TsTypeQuery, TsTypeQueryExpr,
            TsTypeRef, UnaryExpr, UnaryOp,
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

/// Represents an unsupported indexer.
pub enum UnsupportedIndexer<'a> {
    /// Indicates a type.
    Type(&'a TsType),
    /// Indicates a computed property.
    Prop(&'a ComputedPropName),
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
    UnsupportedIndexer(UnsupportedIndexer<'a>),
    /// Indicates an unsupported node.
    UnsupportedNode(UnsupportedNode<'a>),
    /// Indicates an unsupported interpolation.
    UnsupportedInterpolation(&'a CallExpr),
    /// Indicates an unused interpolation.
    UnusedInterpolation(&'a CallExpr),
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

/// Represents an output type of a collect substitution.
pub enum CollectOutput {
    /// Indicates an array.
    Array,
    /// Indicates a full name.
    Full,
}

/// Represents the substitution of an expression with its name.
enum NameSubstitution<'a> {
    /// Indicates the substitution of the expression with the last part of its name.
    Tail(NamedNode<'a>),
    /// Indicates the substitution of the expression with the collection of all named parts of the node.
    Collect {
        /// The index of the first segment to collect.
        start_index: Option<isize>,
        /// The contexts of the local parameters.
        local_contexts: Vec<SyntaxContext>,
        /// The output formatting of the collected segments.
        output: CollectOutput,
        /// The node to transform.
        node: NamedNode<'a>,
    },
}

/// Represents a method of the `nameof` interface.
pub enum NameofMethod {
    /// Indicates a method acting on all parts of the name of an object.
    Collect(CollectOutput),
    /// Indicates a method for injecting plain java into the result of a `Full` call.
    Interpolate,
    /// Indicates a method for determining the name of multiple objects.
    Array,
}

/// Represents the source to get the name from.
pub enum NameSource<'a> {
    /// Indicates a call expression.
    Call(&'a CallExpr),
    /// Indicates function arguments.
    Args(
        &'a CallExpr,
        &'a [ExprOrSpread],
        &'a Option<Box<TsTypeParamInstantiation>>,
    ),
    /// Indicates a parameter.
    Param(&'a ExprOrSpread),
    /// Indicates an expression.
    Expr(&'a Expr),
}

/// Represents a common `nameof` expression.
struct CommonExpr<'a> {
    /// The [`CallExpr`] holding the `nameof` call.
    call: &'a CallExpr,
    /// The requested method.
    method: Option<NameofMethod>,
}

/// Represents a `nameof` call expression.
enum NameofExpression<'a> {
    /// Indicates a common `nameof` expression.
    Common(CommonExpr<'a>),
    /// Indicates a typed property access.
    Typed(&'a Expr),
}

/// Represents the literal value of a computed property.
enum LitValue {
    /// Indicates a string value.
    Str(String),
    /// Indicates a numeric value.
    Num(f64),
}

/// Represents the format of a segment.
enum SegmentFormat<'a> {
    /// Indicates an identifier.
    Ident(String),
    /// Indicates a computed property.
    ComputedProp(LitValue),
    /// Indicates an interpolation.
    Interpolation(&'a CallExpr),
}

impl<'a> SegmentFormat<'a> {
    /// Gets the name of the segment.
    fn get_name(self) -> NameofResult<'a, String> {
        Ok(match self {
            Self::Ident(name) => name,
            Self::ComputedProp(value) => match value {
                LitValue::Str(str) => str,
                LitValue::Num(num) => num.to_string(),
            },
            Self::Interpolation(call) => return Err(NameofError::UnsupportedInterpolation(call)),
        })
    }
}

/// Represents an expression with custom names.
pub struct CustomExpr {
    /// The name of the segment.
    tail: String,
    /// The names of the subsequent segments.
    segments: Box<dyn Iterator<Item = String>>,
}

/// Represents an expression which has a name.
enum NamedExpr<'a> {
    /// Indicates an expression.
    Expr(&'a Expr),
    /// Indicates a `super` keyword.
    Super(&'a Super),
    /// Indicates a custom segment.
    Custom(CustomExpr),
}

/// Represents a type which has a name.
enum NamedType<'a> {
    /// Indicates a type.
    Type(&'a TsType),
    /// Indicates an entity name.
    Name(&'a TsEntityName),
}

/// Represents the context of a named node.
struct NameContext<'a> {
    /// The named node.
    node: NamedNode<'a>,
    /// The syntax contexts which hold local variables.
    syntax_contexts: Vec<SyntaxContext>,
}

/// Represents the segment of a name.
trait NameSegment<'a> {
    /// Gets the format of the segment.
    fn get_format(&self) -> NameofResult<'a, SegmentFormat<'a>>;

    /// Gets the name of the segment.
    fn get_name(&self) -> NameofResult<'a, String> {
        self.get_format()?.get_name()
    }

    /// Gets the next segment.
    fn get_next(&mut self) -> Option<Box<Self>>;

    /// Appends the name of this segment to the specified `literal`.
    fn append(&self, literal: &mut Tpl) -> NameofResult<'a, ()> {
        let format = self.get_format()?;

        if literal.quasis.len() == 0 {
            if let SegmentFormat::Ident(name) = format {
                literal.quasis.push(TplElement {
                    raw: name.into(),
                    ..Default::default()
                });

                return Ok(());
            } else {
                literal.quasis.push(Default::default())
            }
        }

        let current_quasi = literal.quasis.last_mut().unwrap();
        let mut current_text = current_quasi.raw.to_string();

        current_text.push_str(&match &format {
            SegmentFormat::ComputedProp(indexer) => format!(
                "[{}]",
                match indexer {
                    LitValue::Str(str) => format!("\"{str}\""),
                    LitValue::Num(num) => num.to_string(),
                }
            ),
            SegmentFormat::Ident(name) => format!(".{name}"),
            SegmentFormat::Interpolation(_) => "[".to_string(),
        });

        current_quasi.raw = current_text.into();

        if let SegmentFormat::Interpolation(call) = format {
            match call.args.first() {
                None => todo!("Warn about absence of args"),
                Some(ExprOrSpread {
                    spread: Some(spread),
                    ..
                }) => return Err(NameofError::Spread(&spread)),
                Some(ExprOrSpread { spread: None, expr }) => {
                    literal.exprs.push(expr.clone());
                    literal.quasis.push(Default::default());
                }
            }
        }

        Ok(())
    }
}

/// Represents the segment of an expression.
struct ExprSegment<'a, 'b, 'c> {
    /// The visitor of the current transformation.
    visitor: &'a NameofVisitor,
    /// The contexts of the local parameters.
    local_contexts: &'b Vec<SyntaxContext>,
    /// The expression of the segment.
    expr: NamedExpr<'c>,
}

impl<'a, 'b, 'c> ExprSegment<'a, 'b, 'c> {
    /// Initializes a new instance of the [`ExprSegment`] class.
    fn new(
        visitor: &'a NameofVisitor,
        local_contexts: &'b Vec<SyntaxContext>,
        expr: &'c Expr,
    ) -> Self {
        Self {
            visitor,
            local_contexts,
            expr: NamedExpr::Expr(expr),
        }
    }

    /// Unwraps the expression nested inside the specified `expr`.
    fn unwrap_expr<'d>(expr: &'d Expr) -> &'d Expr {
        match expr {
            Expr::Paren(ParenExpr { expr, .. })
            | Expr::TsNonNull(TsNonNullExpr { expr, .. })
            | Expr::TsAs(TsAsExpr { expr, .. }) => {
                return expr;
            }
            expr => expr,
        }
    }

    /// Gets the [`SegmentFormat`] of the specified `member`.
    fn get_member_format<'d>(&self, member: &'d MemberExpr) -> NameofResult<'d, SegmentFormat<'d>> {
        Ok(SegmentFormat::Ident(match &member.prop {
            MemberProp::Ident(ident) => ident.sym.to_string(),
            MemberProp::PrivateName(name) => print_node(name)?,
            MemberProp::Computed(prop) => return self.get_computed_prop_format(prop),
        }))
    }

    /// Gets the [`SegmentFormat`] of the specified `prop`.
    fn get_computed_prop_format<'d>(
        &self,
        prop: &'d ComputedPropName,
    ) -> NameofResult<'d, SegmentFormat<'d>> {
        Ok(SegmentFormat::ComputedProp(match &*prop.expr {
            Expr::Lit(Lit::Str(str)) => LitValue::Str(str.value.to_string()),
            Expr::Lit(Lit::Num(num)) => LitValue::Num(num.value),
            Expr::Call(_) => match self.visitor.get_nameof_expression(&prop.expr) {
                Ok(Some(NameofExpression::Common(CommonExpr {
                    call,
                    method: Some(NameofMethod::Interpolate),
                }))) => return Ok(SegmentFormat::Interpolation(call)),
                _ => {
                    return Err(NameofError::UnsupportedIndexer(UnsupportedIndexer::Prop(
                        prop,
                    )))
                }
            },
            _ => {
                return Err(NameofError::UnsupportedIndexer(UnsupportedIndexer::Prop(
                    prop,
                )))
            }
        }))
    }

    /// Gets the parent segment of the specified `member`.
    fn get_member_parent(&self, member: &'c MemberExpr) -> Option<Self> {
        Some(match &*member.obj {
            Expr::Ident(ident) if self.local_contexts.contains(&ident.ctxt) => return None,
            obj => Self::new(self.visitor, self.local_contexts, obj),
        })
    }

    /// Builds a [`NameSegment`] based on the specified `names`.
    fn build_custom_segment(
        visitor: &'a NameofVisitor,
        local_contexts: &'b Vec<SyntaxContext>,
        mut names: Vec<String>,
    ) -> Option<Self> {
        let tail = names.pop()?;

        Some(Self {
            visitor,
            local_contexts,
            expr: NamedExpr::Custom(CustomExpr {
                tail,
                segments: Box::new(names.into_iter()),
            }),
        })
    }
}

impl<'a, 'b, 'c> NameSegment<'c> for ExprSegment<'a, 'b, 'c> {
    fn get_format(&self) -> NameofResult<'c, SegmentFormat<'c>> {
        Ok(SegmentFormat::Ident(match self.expr {
            NamedExpr::Super(expr) => print_node(expr)?,
            NamedExpr::Expr(expr) => match Self::unwrap_expr(expr) {
                Expr::Paren(ParenExpr { expr, .. })
                | Expr::TsNonNull(TsNonNullExpr { expr, .. })
                | Expr::TsAs(TsAsExpr { expr, .. }) => {
                    return Self::new(self.visitor, self.local_contexts, &*expr).get_format()
                }
                Expr::Ident(Ident { sym: name, .. })
                | Expr::PrivateName(PrivateName { name, .. }) => name.to_string(),
                Expr::This(this) => print_node(this)?,
                Expr::Member(member) => return self.get_member_format(member),
                Expr::MetaProp(meta) => print_node(meta)?.split('.').last().unwrap().to_string(),
                Expr::OptChain(OptChainExpr { base, .. }) => match &**base {
                    OptChainBase::Member(member) => return self.get_member_format(member),
                    _ => return Err(NameofError::UnsupportedNode(UnsupportedNode::Expr(expr))),
                },
                Expr::SuperProp(SuperPropExpr { prop, .. }) => match prop {
                    SuperProp::Ident(IdentName { sym, .. }) => sym.to_string(),
                    SuperProp::Computed(prop) => return self.get_computed_prop_format(prop),
                },
                _ => return Err(NameofError::UnsupportedNode(UnsupportedNode::Expr(expr))),
            },
            NamedExpr::Custom(CustomExpr { ref tail, .. }) => String::from(tail),
        }))
    }

    fn get_next(&mut self) -> Option<Box<Self>> {
        Some(Box::new(match &mut self.expr {
            NamedExpr::Super(_) => return None,
            NamedExpr::Expr(expr) => match Self::unwrap_expr(expr) {
                Expr::Member(member) => self.get_member_parent(member)?,
                Expr::MetaProp(meta) => {
                    let names: Vec<String> = print_node(meta)
                        .ok()?
                        .split('.')
                        .rev()
                        .skip(1)
                        .map(|s| s.to_owned())
                        .collect();

                    Self::build_custom_segment(self.visitor, self.local_contexts, names)?
                }
                Expr::OptChain(OptChainExpr { base, .. }) => match &**base {
                    OptChainBase::Member(member) => self.get_member_parent(member)?,
                    _ => return None,
                },
                Expr::SuperProp(SuperPropExpr { obj, .. }) => Self {
                    visitor: self.visitor,
                    local_contexts: self.local_contexts,
                    expr: NamedExpr::Super(obj),
                },
                _ => return None,
            },
            NamedExpr::Custom(CustomExpr { segments, .. }) => {
                Self::build_custom_segment(self.visitor, self.local_contexts, segments.collect())?
            }
        }))
    }
}

/// Represents the segment of a type name.
struct TypeSegment<'a, 'b> {
    /// The contexts of the local parameters.
    local_contexts: &'b Vec<SyntaxContext>,
    /// The type of the current segment.
    ts_type: NamedType<'a>,
}

impl<'a, 'b> TypeSegment<'a, 'b> {
    /// Initializes a new type segment.
    fn new(local_contexts: &'b Vec<SyntaxContext>, ts_type: &'a TsType) -> Self {
        Self {
            local_contexts,
            ts_type: NamedType::Type(ts_type),
        }
    }

    /// Gets the type contained within the specified `ts_type`.
    fn unwrap_type<'c>(ts_type: &'c TsType) -> &'c TsType {
        match ts_type {
            TsType::TsParenthesizedType(TsParenthesizedType { type_ann, .. }) => type_ann,
            ts_type => ts_type,
        }
    }

    /// Gets the last part of the specified `ts_entity_name`.
    fn get_entity_name<'c>(entity_name: &'c TsEntityName) -> NameofResult<'c, String> {
        Ok(match entity_name {
            TsEntityName::Ident(ident) => ident.sym.to_string(),
            TsEntityName::TsQualifiedName(qualified_name) => qualified_name.right.sym.to_string(),
        })
    }

    /// Gets the parent segment of the specified `name`.
    fn get_entity_parent(&self, name: &'a TsEntityName) -> Option<Self> {
        Some(match name {
            TsEntityName::TsQualifiedName(qualified) => match &**qualified {
                TsQualifiedName {
                    left: TsEntityName::Ident(ident),
                    ..
                } if self.local_contexts.contains(&ident.ctxt) => {
                    return None;
                }
                qualified => Self {
                    local_contexts: self.local_contexts,
                    ts_type: NamedType::Name(&qualified.left),
                },
            },
            _ => return None,
        })
    }
}

impl<'a, 'b> NameSegment<'a> for TypeSegment<'a, 'b> {
    fn get_format(&self) -> NameofResult<'a, SegmentFormat<'a>> {
        Ok(SegmentFormat::Ident(match self.ts_type {
            NamedType::Name(name) => Self::get_entity_name(name)?,
            NamedType::Type(ts_type) => match Self::unwrap_type(ts_type) {
                TsType::TsTypeRef(TsTypeRef {
                    type_name: name, ..
                })
                | TsType::TsImportType(TsImportType {
                    qualifier: Some(name),
                    ..
                })
                | TsType::TsTypeQuery(TsTypeQuery {
                    expr_name:
                        TsTypeQueryExpr::TsEntityName(name)
                        | TsTypeQueryExpr::Import(TsImportType {
                            qualifier: Some(name),
                            ..
                        }),
                    ..
                }) => Self::get_entity_name(name)?,
                TsType::TsIndexedAccessType(TsIndexedAccessType { index_type, .. }) => {
                    match &**index_type {
                        TsType::TsLitType(TsLitType { lit, .. }) => {
                            return Ok(SegmentFormat::ComputedProp(match lit {
                                TsLit::Number(num) => LitValue::Num(num.value),
                                TsLit::Str(str) => LitValue::Str(str.value.to_string()),
                                _ => {
                                    return Err(NameofError::UnsupportedIndexer(
                                        UnsupportedIndexer::Type(index_type),
                                    ))
                                }
                            }))
                        }
                        ts_type => {
                            return Err(NameofError::UnsupportedIndexer(UnsupportedIndexer::Type(
                                ts_type,
                            )))
                        }
                    }
                }
                TsType::TsKeywordType(keyword) => print_node(keyword)?,
                TsType::TsThisType(this_type) => print_node(this_type)?,
                ts_type => {
                    return Err(NameofError::UnsupportedNode(UnsupportedNode::Type(ts_type)))
                }
            },
        }))
    }

    fn get_next(&mut self) -> Option<Box<Self>> {
        Some(Box::new(match self.ts_type {
            NamedType::Name(name) => self.get_entity_parent(name)?,
            NamedType::Type(ts_type) => match Self::unwrap_type(ts_type) {
                TsType::TsTypeRef(TsTypeRef {
                    type_name: name, ..
                })
                | TsType::TsTypeQuery(TsTypeQuery {
                    expr_name: TsTypeQueryExpr::TsEntityName(name),
                    ..
                }) => self.get_entity_parent(name)?,
                TsType::TsIndexedAccessType(TsIndexedAccessType { obj_type, .. }) => {
                    Self::new(self.local_contexts, &obj_type)
                }
                _ => return None,
            },
        }))
    }
}

/// Provides the functionality to collect segments in different formats.
trait SegmentCollector<'a> {
    /// Returns either the names of the segments as a vector or an error.
    fn split(self: Box<Self>) -> NameofResult<'a, Vec<String>>;
    /// Returns either the names of the segments as a dotted path or an error.
    fn full(self: Box<Self>) -> NameofResult<'a, Expr>;
}

/// Provides the functionality to walk over segments.
struct SegmentWalker<S> {
    /// The index of the first segment to include.
    start_index: Option<isize>,
    /// The current name segment.
    current: Option<S>,
}

impl<'a, S> SegmentWalker<S>
where
    S: NameSegment<'a>,
{
    /// Gets the segments to collect.
    fn get_segments(self: Box<Self>) -> Vec<S> {
        match self.start_index {
            Some(index) => {
                if index < 0 {
                    self.take(-index as usize).collect()
                } else {
                    let items = self.collect::<Vec<_>>();
                    let len = items.len();
                    items.into_iter().take(len - (index as usize)).collect()
                }
            }
            _ => self.collect(),
        }
    }
}

impl<'a, S> Iterator for SegmentWalker<S>
where
    S: NameSegment<'a>,
{
    type Item = S;

    fn next(&mut self) -> Option<Self::Item> {
        let mut result = self.current.take();

        if let Some(segment) = &mut result {
            self.current = segment.get_next().map(|s| *s);
        }

        result
    }
}

impl<'a, S> SegmentCollector<'a> for SegmentWalker<S>
where
    S: NameSegment<'a>,
{
    fn split(self: Box<Self>) -> NameofResult<'a, Vec<String>> {
        let mut names = Vec::new();

        for segment in self.get_segments() {
            match segment.get_name() {
                Ok(name) => names.push(name),
                Err(err) => return Err(err),
            }
        }

        Ok(names.into_iter().rev().collect())
    }

    fn full(self: Box<Self>) -> NameofResult<'a, Expr> {
        let mut result = Tpl::default();

        for segment in self.get_segments().into_iter().rev() {
            segment.append(&mut result)?;
        }

        Ok(match result.exprs.len() {
            0 => Expr::Lit(Lit::from(result.quasis.last().unwrap().raw.to_string())),
            _ => Expr::Tpl(result),
        })
    }
}

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
            NameofExpression::Common(CommonExpr { call, method }) => match method {
                Some(method) => match method {
                    NameofMethod::Collect(format) => {
                        let (start_index, args) = Self::parse_collect_args(&call.args);

                        let NameContext {
                            node,
                            syntax_contexts,
                        } = Self::get_name_context(NameSource::Args(call, &args, &call.type_args))?;

                        NameSubstitution::Collect {
                            start_index,
                            local_contexts: syntax_contexts,
                            output: format,
                            node,
                        }
                    }
                    NameofMethod::Interpolate => {
                        return Err(NameofError::UnusedInterpolation(&call));
                    }
                    _ => todo!("Add support for remaining methods."),
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
                NamedNode::Expr(expr) => ExprSegment::new(self, &vec![], expr).get_name()?,
                NamedNode::Type(ts_type) => TypeSegment::new(&vec![], ts_type).get_name()?,
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
                        current: Some(ExprSegment::new(self, &local_contexts, expr)),
                    }),
                    NamedNode::Type(ts_type) => Box::new(SegmentWalker {
                        start_index,
                        current: Some(TypeSegment::new(&local_contexts, ts_type)),
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
                    (1, 0) => NameContext {
                        node: NamedNode::Type(&*type_args.as_ref().unwrap().params[0]),
                        syntax_contexts: vec![],
                    },
                    (type_arg_count, arg_count) => {
                        return Err(NameofError::ArgumentError(call, type_arg_count, arg_count))
                    }
                }
            }
            NameSource::Param(param) => match param {
                ExprOrSpread {
                    spread: Some(_), ..
                } => return Err(NameofError::Spread(param.spread.as_ref().unwrap())),
                ExprOrSpread { spread: None, expr } => {
                    Self::get_name_context(NameSource::Expr(expr))?
                }
            },
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
