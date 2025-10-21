use crate::ast::MemberExpr;

/// Represents an output type of a collect substitution.
pub enum CollectOutput {
    /// Indicates an array.
    Array,
    /// Indicates a full name.
    Full,
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

/// Represents a common `nameof` expression.
pub struct CommonExpr {
    /// The requested method.
    pub method: Option<NameofMethod>,
}

/// Represents a `nameof` expression.
pub enum NameofExpression<'a, N> {
    /// Indicates a common `nameof` expression.
    Common(CommonExpr),
    /// Indicates a typed property access.
    Typed(&'a MemberExpr<'a, N>),
}
