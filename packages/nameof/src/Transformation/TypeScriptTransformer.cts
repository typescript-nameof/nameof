import { IErrorHandler } from "@typescript-nameof/common";
import { Node } from "typescript";
import { IPluginConfig } from "./IPluginConfig.cjs";
import { ITypeScriptContext } from "./ITypeScriptContext.cjs";
import { TypeScriptFeatures } from "./TypeScriptFeatures.cjs";
import { TypeScriptTransformerBase } from "./TypeScriptTransformerBase.cjs";

/**
 * Provides the functionality to transform code using TypeScript.
 *
 * @template TFeatures
 * The type of the features for the transformer.
 */
export class TypeScriptTransformer extends TypeScriptTransformerBase<TypeScriptFeatures>
{
    /**
     * Initializes a new instance of the {@linkcode TypeScriptTransformerBase} class.
     *
     * @param config
     * The configuration of the plugin.
     *
     * @param errorHandler
     * A component for reporting errors.
     */
    public constructor(config?: IPluginConfig, errorHandler?: IErrorHandler<Node, ITypeScriptContext>)
    {
        super(new TypeScriptFeatures(config, errorHandler));
    }
}
