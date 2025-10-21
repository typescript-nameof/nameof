/// Represents an identifier.
pub trait Ident<'a> {
    /// Gets the name of the identifier.
    fn get_name(&self) -> &'a str;
}
