use swc_core::{
    atoms::Atom,
    common::SyntaxContext,
    ecma::{
        ast::{Ident, Program},
        visit::{visit_mut_pass, VisitMut, VisitMutWith},
    },
    plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};

pub struct NameofVisitor {
    /// The context assigned to global variables.
    unresolved_context: SyntaxContext,
}

impl NameofVisitor {
    fn is_global_nameof(&self, ident: &Ident) -> bool {
        ident.sym == "nameof" && ident.ctxt == self.unresolved_context
    }
}

impl VisitMut for NameofVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html
    fn visit_mut_ident(&mut self, node: &mut Ident) {
        node.visit_mut_children_with(self);

        if self.is_global_nameof(node) {
            node.sym = Atom::new("dosenbrot");
        }
    }
}

/// An example plugin function with macro support.
/// `plugin_transform` macro interop pointers into deserialized structs, as well
/// as returning ptr back to host.
///
/// It is possible to opt out from macro by writing transform fn manually
/// if plugin need to handle low-level ptr directly via
/// `__transform_plugin_process_impl(
///     ast_ptr: *const u8, ast_ptr_len: i32,
///     unresolved_mark: u32, should_enable_comments_proxy: i32) ->
///     i32 /*  0 for success, fail otherwise.
///             Note this is only for internal pointer interop result,
///             not actual transform result */`
///
/// This requires manual handling of serialization / deserialization from ptrs.
/// Refer swc_plugin_macro to see how does it work internally.
#[plugin_transform]
pub fn process_transform(program: Program, data: TransformPluginProgramMetadata) -> Program {
    program.apply(&mut visit_mut_pass(NameofVisitor {
        unresolved_context: SyntaxContext::empty().apply_mark(data.unresolved_mark),
    }))
}

#[cfg(test)]
mod tests {
    use swc_core::{
        common::{Mark, SyntaxContext},
        ecma::{
            transforms::{base::resolver, testing::test_inline},
            visit::visit_mut_pass,
        },
    };

    use crate::NameofVisitor;

    // An example to test plugin transform.
    // Recommended strategy to test plugin's transform is verify
    // the Visitor's behavior, instead of trying to run `process_transform` with mocks
    // unless explicitly required to do so.
    test_inline!(
        Default::default(),
        |_| {
            let unresolved_mark = Mark::new();
            let top_level_mark = Mark::new();

            (
                resolver(unresolved_mark, top_level_mark, true),
                visit_mut_pass(NameofVisitor {
                    unresolved_context: SyntaxContext::empty().apply_mark(unresolved_mark),
                }),
            )
        },
        boo,
        // Input codes
        r#"console.log(nameof);"#,
        // Output codes after transformed with plugin
        r#"console.log(dosenbrot);"#
    );
}
