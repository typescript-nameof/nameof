pub use crate::ast::Ident;

mod ast;

pub fn get_name<'a>(node: impl Ident<'a>) -> &'a str {
    node.get_name()
}
