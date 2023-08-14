import { IErrorHandler } from "@typescript-nameof/common";
import { TransformerExtras } from "ts-patch";
import { Node } from "typescript";
import { TSPatchFeatures } from "./TSPatchFeatures";
import { TypeScriptTransformerBase } from "./TypeScriptTransformerBase";

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
     * @param errorHandler
     * A component for reporting errors.
     */
    public constructor(extras: TransformerExtras, errorHandler?: IErrorHandler<Node>)
    {
        super(new TSPatchFeatures(extras, errorHandler));
    }
}
