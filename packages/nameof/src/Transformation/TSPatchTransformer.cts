import { IErrorHandler } from "@typescript-nameof/common";
import { TransformerExtras } from "ts-patch";
import { Node } from "typescript";
import { IPluginConfig } from "./IPluginConfig.cjs";
import { ITypeScriptContext } from "./ITypeScriptContext.cjs";
import { TSPatchFeatures } from "./TSPatchFeatures.cjs";
import { TypeScriptTransformerBase } from "./TypeScriptTransformerBase.cjs";

/**
 * Provides the functionality to transform typescript nodes using `ts-patch`.
 */
export class TSPatchTransformer extends TypeScriptTransformerBase<TSPatchFeatures>
{
    /**
     * Initializes a new instance of the {@linkcode TSPatchTransformer} class.
     *
     * @param extras
     * A set of tools for interacting with `ts-patch`.
     *
     * @param config
     * The configuration of the plugin.
     *
     * @param errorHandler
     * A component for reporting errors.
     */
    public constructor(extras: TransformerExtras, config?: IPluginConfig, errorHandler?: IErrorHandler<Node, ITypeScriptContext>)
    {
        super(new TSPatchFeatures(extras, config, errorHandler));
    }
}
