/// Represents an expression.
pub enum Expr<'a, N> {
    /// Indicates a property accessor.
    Member(MemberExpr<'a, N>),
    /// Indicates a call expression.
    Call(CallExpr<'a, N>),
    /// Indicates an identifier.
    Ident(Box<dyn Ident<'a, N>>),
    /// Indicates an unsupported expression.
    Unsupported,
}

/// Represents a property accessor.
pub struct MemberExpr<'a, N> {
    /// The owner of the property being accessed.
    pub obj: Box<Expr<'a, N>>,
    /// The property being accessed.
    pub prop: MemberProp<'a, N>,
}

/// Represents the property
pub enum MemberProp<'a, N> {
    /// Indicates an identifier.
    Ident(Box<dyn Ident<'a, N>>),
    /// Indicates an unsupported property.
    Unsupported,
}

/// Represents an expression being called.
pub enum Callee<'a, N> {
    /// Indicates an expression.
    Expr(Box<Expr<'a, N>>),
    /// Indicates an unsupported expression.
    Unsupported,
}

/// Represents a call expression.
pub struct CallExpr<'a, N> {
    /// The expression being called.
    pub callee: Callee<'a, N>,
}

/// Represents an identifier.
pub trait Ident<'a, N> {
    /// Gets a value indicating whether the 
    fn is_global(&self) -> bool;
    /// Gets the source of the identifier.
    fn get_source(&self) -> &'a N;
    /// Gets the name of the identifier.
    fn get_name(&self) -> &'a str;
}
