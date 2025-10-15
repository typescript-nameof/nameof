use std::sync::Arc;

use swc::Compiler;
use swc_compiler_base::IdentCollector;
use swc_core::{
    common::{FileName, SourceMap},
    ecma::{ast::{Expr, ExprOrSpread}, visit::VisitWith},
};
use swc_ecma_codegen::Node;

use crate::diagnostics::{NameofError, NameofResult};

/// Prints the source code represented by the specified `node`.
pub fn print_node<T>(node: &T) -> NameofResult<String>
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

/// Unwraps the specified `arg`.
pub fn unwrap_arg(arg: &ExprOrSpread) -> NameofResult<&Expr> {
    match arg {
        ExprOrSpread { spread: None, expr } => Ok(expr),
        ExprOrSpread {
            spread: Some(spread),
            ..
        } => Err(NameofError::Spread(spread)),
    }
}
