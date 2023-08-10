// eslint-disable-next-line node/no-unpublished-import
import type * as babel from "@babel/core";
import { BabelAdapter } from "./BabelAdapter";
import { ParseOptions } from "./parse";
import { BabelTransformer } from "./Transformation/BabelTransformer";

export { ITransformTarget } from "./ITransformTarget";
export { BabelAdapter, BabelTransformer };

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
export function plugin(context: typeof babel): babel.PluginItem
{
    return new BabelTransformer(context).Plugin;
}
