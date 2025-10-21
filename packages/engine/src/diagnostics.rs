use crate::ast::Ident;

/// Represents an error which occurred while performing a `nameof`-substitution.
pub enum NameofError<'a, N> {
    /// Indicates the use of an invalid method on the `nameof` interface.
    InvalidMethod(&'a dyn Ident<'a, N>),
}
