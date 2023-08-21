import { IErrorHandler } from "@typescript-nameof/common";
import { Node } from "typescript";
import { IPluginConfig } from "./IPluginConfig";
import { ITypeScriptContext } from "./ITypeScriptContext";
import { TypeScriptFeatures } from "./TypeScriptFeatures";
import { TypeScriptTransformerBase } from "./TypeScriptTransformerBase";

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
