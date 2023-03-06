/// @ts-check
/// <reference path="references.d.ts" />
import { transformNode } from "@ts-nameof/transforms-babel";
import { createMacro, MacroError } from "babel-plugin-macros";

// eslint-disable-next-line import/no-default-export
export default createMacro(nameofMacro);

/**
 * Transforms `nameof` calls.
 *
 * @param {any} context
 * The context of the macro.
 */
// @ts-ignore
function nameofMacro(context)
{
    // go over in reverse as if traversing in post order
    const reverseDefault = context.references.default.slice().reverse();

    // @ts-ignore
    reverseDefault.forEach(path =>
    {
        const t = context.babel.types;

        transformNode(
            t,
            getPath(),
            {
                // tell the transformation to expect this identifier's name
                nameofIdentifierName: path.node.name
            });

        /**
         * Gets the path to the node to transform.
         *
         * @returns {any}
         * The path to the node to transform.
         */
        function getPath()
        {
            const parentPath = path.parentPath; // identifier;

            if (parentPath.type === "CallExpression")
            {
                return parentPath;
            }

            const grandParentPath = parentPath.parentPath;

            if (parentPath.type === "MemberExpression" && grandParentPath.type === "CallExpression")
            {
                return grandParentPath;
            }

            throw new MacroError(`[ts-nameof]: Could not find a call expression at path: ${grandParentPath.getSource()}`);
        }
    });
}
