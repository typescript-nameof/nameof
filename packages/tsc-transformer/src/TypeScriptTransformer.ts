import { IErrorHandler } from "@typescript-nameof/common";
import { Node } from "typescript";
import { TypeScriptFeatures } from "./Transformation/TypeScriptFeatures";
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
    public constructor(errorHandler?: IErrorHandler<Node>)
    {
        super(new TypeScriptFeatures(errorHandler));
    }
}
