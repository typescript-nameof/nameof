import { IErrorHandler } from "@typescript-nameof/common";
import { Node } from "typescript";
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
     * @param errorHandler
     * A component for reporting errors.
     */
    public constructor(errorHandler?: IErrorHandler<Node, ITypeScriptContext>)
    {
        super(new TypeScriptFeatures(errorHandler));
    }
}
