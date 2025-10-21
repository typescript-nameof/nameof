use crate::{
    ast::{CallExpr, Callee, Expr, Ident, MemberExpr, MemberProp}, diagnostics::NameofError, serialization::{CommonExpr, NameofExpression, NameofMethod}
};

mod ast;
mod diagnostics;
mod serialization;

pub trait Node {}

/// Provides the functionality to substitute `nameof` calls.
pub struct NameofEngine {
    /// The name of the `nameof` variable.
    nameof_name: String,
}

impl<'a> NameofEngine {
    /// Gets a value indicating whether the specified identifier is the global `nameof` object.
    fn is_global_nameof<N>(&self, ident: &Box<dyn Ident<'a, N>>) -> bool {
        ident.is_global() && ident.get_name() == self.nameof_name
    }

    /// Gets the `nameof` expression in the specified `node`.
    ///
    /// # Returns
    /// Either [`None`] if the underlying `node` is no `nameof` expression or
    /// a [`NameofResult`] holding either a [`NameofError`] or the [`NameofExpression`].
    fn get_nameof_expression<N>(
        &self,
        expr: &'a Expr<'a, N>,
    ) -> Result<Option<NameofExpression<'a, N>>, NameofError<'a, N>> {
        match expr {
            Expr::Call(CallExpr {
                callee: Callee::Expr(callee),
                ..
            }) => Ok(Some(NameofExpression::Common(CommonExpr {
                method: match &**callee {
                    Expr::Ident(ident) if self.is_global_nameof(ident) => None,
                    Expr::Member(MemberExpr {
                        obj,
                        prop: MemberProp::Ident(prop),
                    }) => match &**obj {
                        Expr::Ident(ident) if self.is_global_nameof(ident) => {
                            Some(match prop.get_name() {
                                _ => {
                                    return Err(NameofError::InvalidMethod(ident.as_ref()))
                                }
                            })
                        },
                        _ => return Ok(None),
                    }
                    _ => return Ok(None),
                },
            }))),
            _ => Ok(None),
        }
    }
}
