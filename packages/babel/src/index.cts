// eslint-disable-next-line n/no-unpublished-import
import type babel from "@babel/core";
import { BabelTransformer } from "./Transformation/BabelTransformer.cjs";

export { BabelTransformer };

/**
 * Creates a plugin for transforming `nameof` calls.
 *
 * @param context
 * The context of the plugin.
 *
 * @returns
 * A plugin for transforming `nameof` calls.
 */
function plugin(context: typeof babel): babel.PluginItem
{
    return new BabelTransformer(context).Plugin;
}

export default (plugin as any);
