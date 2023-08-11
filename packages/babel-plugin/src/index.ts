import babel = require("@babel/core");
import { BabelTransformer } from "./Transformation/BabelTransformer";

export { ITransformTarget } from "./ITransformTarget";
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
// eslint-disable-next-line import/no-default-export
export default function plugin(context: typeof babel): babel.PluginItem
{
    return new BabelTransformer(context).Plugin;
}
