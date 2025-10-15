use swc_core::{
    common::SyntaxContext,
    ecma::ast::{CallExpr, Expr},
};

use crate::{
    diagnostics::{NameofError, NameofResult},
    NamedNode,
};

/// Represents an output type of a collect substitution.
pub enum CollectOutput {
    /// Indicates an array.
    Array,
    /// Indicates a full name.
    Full,
}

/// Represents the substitution of an expression with its name.
pub enum NameSubstitution<'a> {
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
    Array {
        local_contexts: Vec<SyntaxContext>,
        nodes: Vec<NamedNode<'a>>,
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

/// Represents a common `nameof` expression.
pub struct CommonExpr<'a> {
    /// The contexts of the local parameters.
    pub local_contexts: Vec<SyntaxContext>,
    /// The [`CallExpr`] holding the `nameof` call.
    pub call: &'a CallExpr,
    /// The requested method.
    pub method: Option<NameofMethod>,
}

/// Represents a `nameof` call expression.
pub enum NameofExpression<'a> {
    /// Indicates a common `nameof` expression.
    Common(CommonExpr<'a>),
    /// Indicates a typed property access.
    Typed(&'a Expr),
}

/// Represents the literal value of a computed property.
pub enum LitValue {
    /// Indicates a string value.
    Str(String),
    /// Indicates a numeric value.
    Num(f64),
}

/// Represents the format of a segment.
pub enum SegmentFormat<'a> {
    /// Indicates an identifier.
    Ident(String),
    /// Indicates a computed property.
    ComputedProp(LitValue),
    /// Indicates an interpolation.
    Interpolation(&'a CallExpr),
}

impl<'a> SegmentFormat<'a> {
    /// Gets the name of the segment.
    pub fn get_name(self) -> NameofResult<'a, String> {
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
