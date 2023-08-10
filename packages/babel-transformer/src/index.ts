// eslint-disable-next-line node/no-unpublished-import
import type * as babel from "@babel/core";
import type { NodePath } from "@babel/traverse";
import type * as babelTypes from "@babel/types";
import { NameofNodeTransformer, throwErrorForSourceFile } from "@typescript-nameof/common";
import { BabelAdapter } from "./BabelAdapter";
import { ITransformerVisitorContext } from "./IVisitContext";
import { ParseOptions } from "./parse";

export { BabelAdapter };

/**
 * Represents a plugin context.
 */
interface IPluginContext
{
    /**
     * A component for handling babel types.
     */
    types: typeof babelTypes;
}

/**
 * Provides options for transforming babel nodes.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface TransformOptions extends ParseOptions
{
}

/**
 * Creates a plugin for transforming `nameof` calls.
 *
 * @param context
 * The context of the plugin.
 *
 * @returns
 * A plugin for transforming `nameof` calls.
 */
export function plugin(context: IPluginContext): babel.PluginItem
{
    let transformer = new NameofNodeTransformer(new BabelAdapter(context.types));

    const visitor = {
        CallExpression(path: NodePath, state: unknown)
        {
            const filePath = (state as any).file.opts.filename as string;

            try
            {
                transformNode(
                    transformer,
                    path,
                    {
                        traverseChildren: () => path.traverse(visitor, state as any)
                    });
            }
            catch (err: any)
            {
                return throwErrorForSourceFile(err.message, filePath);
            }
        }
    };

    return { visitor };
}

/**
 * Transforms the node at the specified {@linkcode path}.
 *
 * @param transformer
 * A component for performing the transformation.
 *
 * @param path
 * The path to the node to transform.
 *
 * @param options
 * The options for the transformation.
 *
 * @returns
 * The transformed node.
 */
export function transformNode(transformer: NameofNodeTransformer<ITransformerVisitorContext, babelTypes.Node>, path: NodePath, options: ParseOptions): void
{
    let transformed = transformer.Transform(
        {
            path,
            options
        });

    if (transformed)
    {
        path.replaceWith(transformed);
    }
}
