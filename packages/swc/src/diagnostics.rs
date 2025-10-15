use anyhow::Error;
use swc_core::{
    common::Span,
    ecma::ast::{CallExpr, ComputedPropName, Expr, IdentName, TsType},
};

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
    /// Indicates the absence of an accessor to a local variable.
    MissingAccessor(Span, String),
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
pub type NameofResult<'a, T> = Result<T, NameofError<'a>>;
