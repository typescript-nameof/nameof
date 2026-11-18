import type * as babel from "@babel/core" assert { "resolution-mode": "import" };
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
function plugin(context: typeof babel): babel.PluginObject
{
    return new BabelTransformer(context).Plugin;
}

export default (plugin as any);
