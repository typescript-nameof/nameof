// eslint-disable-next-line node/no-unpublished-import
import type * as babel from "@babel/core";
import type { Node, NodePath } from "@babel/traverse";
import type * as babelTypes from "@babel/types";
import { throwErrorForSourceFile } from "@typescript-nameof/core";
import { transformCallExpression } from "@typescript-nameof/transformer-core";
import { parse, ParseOptions } from "./parse";
import { transform } from "./transform";

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
    const visitor = {
        CallExpression(path: NodePath, state: unknown)
        {
            const filePath = (state as any).file.opts.filename as string;

            try
            {
                transformNode(
                    context.types,
                    path,
                    {
                        // temp assertion because I'm too lazy to investigate what's going on here
                        traverseChildren: () => path.traverse(visitor as any, state as any)
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
 * Transforms the node located at the specified {@link path `path`}.
 *
 * @param t
 * A component for handling babel types.
 *
 * @param path
 * The path to the node to transform.
 *
 * @param options
 * The options for the transformation.
 */
export function transformNode(t: typeof babelTypes, path: NodePath, options: TransformOptions = {}): void
{
    const parseResult = parse(t, path, options);

    if (parseResult === undefined)
    {
        return;
    }

    const transformResult = transform(t, transformCallExpression(parseResult));
    // temporary assertion due to conflicting type declaration versions
    path.replaceWith(transformResult as Node);
}
