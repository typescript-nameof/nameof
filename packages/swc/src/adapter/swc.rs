use swc_core::{common::{Span, Spanned, SyntaxContext}, ecma::ast::{CallExpr, ComputedPropName, Expr, ExprOrSpread, Ident, IdentName, Lit, MemberExpr, MemberProp, OptChainBase, OptChainExpr, ParenExpr, PrivateName, Super, SuperProp, SuperPropExpr, TsAsExpr, TsEntityName, TsImportType, TsIndexedAccessType, TsLit, TsLitType, TsNonNullExpr, TsParenthesizedType, TsQualifiedName, TsType, TsTypeParamInstantiation, TsTypeQuery, TsTypeQueryExpr, TsTypeRef}};

use crate::{diagnostics::{NameofError, NameofResult, UnsupportedIndexer, UnsupportedNode}, serialization::{CommonExpr, LitValue, NameofExpression, NameofMethod, SegmentFormat}, transformation::{CheckLocalSegment, GetNodeContext, NameSegment}, utils::print_node, NameofVisitor};

/// Represents a node which contains a name.
pub enum NamedNode<'a> {
    /// Indicates an expression.
    Expr(&'a Expr),
    /// Indicates a type.
    Type(&'a TsType),
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
    /// Indicates a type.
    Type(&'a TsType),
}

/// Represents an expression with custom names.
pub struct CustomExpr {
    /// The span containing the custom expression.
    span: Span,
    /// The name of the segment.
    tail: String,
    /// The names of the subsequent segments.
    segments: Box<dyn Iterator<Item = String>>,
}

/// Represents an expression which has a name.
pub enum NamedExpr<'a> {
    /// Indicates an expression.
    Expr(&'a Expr),
    /// Indicates a `super` keyword.
    Super(&'a Super),
    /// Indicates a custom segment.
    Custom(CustomExpr),
}

impl<'a> GetNodeContext<'a> for NamedExpr<'a> {
    fn get_context(&self) -> Option<&'a SyntaxContext> {
        match self {
            NamedExpr::Expr(Expr::Ident(ident)) => Some(&ident.ctxt),
            _ => None,
        }
    }
}

/// Represents a type which has a name.
pub enum NamedType<'a> {
    /// Indicates a type.
    Type(&'a TsType),
    /// Indicates an entity name.
    Name(&'a TsEntityName),
}

impl<'a> GetNodeContext<'a> for NamedType<'a> {
    fn get_context(&self) -> Option<&'a SyntaxContext> {
        match self {
            NamedType::Type(TsType::TsTypeQuery(TsTypeQuery {
                expr_name: TsTypeQueryExpr::TsEntityName(TsEntityName::Ident(ident)),
                ..
            }))
            | NamedType::Name(TsEntityName::Ident(ident)) => Some(&ident.ctxt),
            _ => None,
        }
    }
}

/// Represents the context of a named node.
pub struct NameContext<'a> {
    /// The named node.
    pub node: NamedNode<'a>,
    /// The syntax contexts which hold local variables.
    pub syntax_contexts: Vec<SyntaxContext>,
}

/// Represents the segment of a chain of nodes.
pub struct NodeSegment<'a, 'b, T> {
    /// The visitor of the current transformation.
    visitor: &'a NameofVisitor,
    /// The contexts of the local parameters.
    local_contexts: &'b Vec<SyntaxContext>,
    /// The node of the segment.
    node: T,
}

impl<'a, 'b, 'c, T: GetNodeContext<'c>> NodeSegment<'a, 'b, T> {
    /// Initializes a new [`NodeSegment`] instance.
    pub fn new(visitor: &'a NameofVisitor, local_contexts: &'b Vec<SyntaxContext>, node: T) -> Self {
        Self {
            visitor,
            local_contexts,
            node,
        }
    }
}

impl<'a, 'b, 'c, T: GetNodeContext<'c>> CheckLocalSegment for NodeSegment<'a, 'b, T> {
    fn is_local(&self) -> bool {
        match self.node.get_context() {
            Some(context) => self.local_contexts.contains(context),
            None => false,
        }
    }
}

impl<'a, 'b, 'c> NodeSegment<'a, 'b, NamedExpr<'c>> {
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
                    ..
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
            obj => Self::new(self.visitor, self.local_contexts, NamedExpr::Expr(obj)),
        })
    }

    /// Builds a [`NameSegment`] based on the specified `names`.
    fn build_custom_segment(
        span: Span,
        visitor: &'a NameofVisitor,
        local_contexts: &'b Vec<SyntaxContext>,
        mut names: Vec<String>,
    ) -> Option<Self> {
        let tail = names.pop()?;

        Some(Self {
            visitor,
            local_contexts,
            node: NamedExpr::Custom(CustomExpr {
                span,
                tail,
                segments: Box::new(names.into_iter()),
            }),
        })
    }
}

impl<'a, 'b, 'c> NameSegment<'c> for NodeSegment<'a, 'b, NamedExpr<'c>> {
    fn get_format(&self) -> NameofResult<'c, SegmentFormat<'c>> {
        Ok(SegmentFormat::Ident(match self.node {
            NamedExpr::Super(expr) => print_node(expr)?,
            NamedExpr::Expr(expr) => match Self::unwrap_expr(expr) {
                Expr::Paren(ParenExpr { expr, .. })
                | Expr::TsNonNull(TsNonNullExpr { expr, .. })
                | Expr::TsAs(TsAsExpr { expr, .. }) => {
                    return Self::new(self.visitor, self.local_contexts, NamedExpr::Expr(expr))
                        .get_format()
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

    fn get_span(&self) -> Span {
        match self.node {
            NamedExpr::Expr(expr) => expr.span(),
            NamedExpr::Super(expr) => expr.span,
            NamedExpr::Custom(CustomExpr { span, .. }) => span,
        }
    }

    fn get_next(&mut self) -> Option<Box<Self>> {
        Some(Box::new(match &mut self.node {
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

                    Self::build_custom_segment(meta.span, self.visitor, self.local_contexts, names)?
                }
                Expr::OptChain(OptChainExpr { base, .. }) => match &**base {
                    OptChainBase::Member(member) => self.get_member_parent(member)?,
                    _ => return None,
                },
                Expr::SuperProp(SuperPropExpr { obj, .. }) => Self {
                    visitor: self.visitor,
                    local_contexts: self.local_contexts,
                    node: NamedExpr::Super(obj),
                },
                _ => return None,
            },
            NamedExpr::Custom(CustomExpr { span, segments, .. }) => Self::build_custom_segment(
                *span,
                self.visitor,
                self.local_contexts,
                segments.collect(),
            )?,
        }))
    }
}

impl<'a, 'b, 'c> NodeSegment<'a, 'b, NamedType<'c>> {
    /// Gets the type contained within the specified `ts_type`.
    fn unwrap_type<'d>(ts_type: &'d TsType) -> &'d TsType {
        match ts_type {
            TsType::TsParenthesizedType(TsParenthesizedType { type_ann, .. }) => type_ann,
            ts_type => ts_type,
        }
    }

    /// Gets the last part of the specified `ts_entity_name`.
    fn get_entity_name<'d>(entity_name: &'d TsEntityName) -> NameofResult<'d, String> {
        Ok(match entity_name {
            TsEntityName::Ident(ident) => ident.sym.to_string(),
            TsEntityName::TsQualifiedName(qualified_name) => qualified_name.right.sym.to_string(),
        })
    }

    /// Gets the parent segment of the specified `name`.
    fn get_entity_parent(&self, name: &'c TsEntityName) -> Option<Self> {
        Some(match name {
            TsEntityName::TsQualifiedName(qualified) => match &**qualified {
                TsQualifiedName {
                    left: TsEntityName::Ident(ident),
                    ..
                } if self.local_contexts.contains(&ident.ctxt) => {
                    return None;
                }
                qualified => Self {
                    visitor: self.visitor,
                    local_contexts: self.local_contexts,
                    node: NamedType::Name(&qualified.left),
                },
            },
            _ => return None,
        })
    }
}

impl<'a, 'b, 'c> NameSegment<'c> for NodeSegment<'a, 'b, NamedType<'c>> {
    fn get_format(&self) -> NameofResult<'c, SegmentFormat<'c>> {
        Ok(SegmentFormat::Ident(match self.node {
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

    fn get_span(&self) -> Span {
        match self.node {
            NamedType::Name(name) => name.span(),
            NamedType::Type(ts_type) => ts_type.span(),
        }
    }

    fn get_next(&mut self) -> Option<Box<Self>> {
        Some(Box::new(match self.node {
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
                    Self::new(self.visitor, self.local_contexts, NamedType::Type(obj_type))
                }
                _ => return None,
            },
        }))
    }
}
