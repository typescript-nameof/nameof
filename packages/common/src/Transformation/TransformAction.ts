import { ITransformationContext } from "../Transformation/ITransformationContext";

/**
 * Represents an action which transforms a file.
 */
export type TransformAction<TNode, TOutput> =
    /**
     * Executes the transformation.
     *
     * @param context
     * The context of the operation.
     */
    (context: ITransformationContext<TNode>) => TOutput;
