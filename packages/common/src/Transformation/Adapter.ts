import { IAdapter } from "./IAdapter";
import { TransformerFeatures } from "./TransformerFeatures";
import { NameofCallExpression, Node } from "../Serialization/nodes";

/**
 * Provides the functionality to parse and dump `nameof` expressions.
 */
export abstract class Adapter<TFeatures extends TransformerFeatures<TInput>, TInput, out TOutput = TInput> implements IAdapter<TInput, TOutput>
{
    /**
     * The features of the transformer integration.
     */
    private features: TFeatures;

    /**
     * Initializes a new instance of the {@linkcode Adapter Adapter<TFeatures, TInput, TOutput>} class.
     *
     * @param features
     * The features of the transformer integration.
     */
    public constructor(features: TFeatures)
    {
        this.features = features;
    }

    /**
     * Gets the features of the transformer integration.
     */
    public get Features(): TFeatures
    {
        return this.features;
    }

    /**
     * @inheritdoc
     *
     * @param item
     * The item to parse.
     */
    public abstract Parse(item: TInput): NameofCallExpression | undefined;

    /**
     * @inheritdoc
     *
     * @param node
     * The node to dump.
     */
    public abstract Dump(node: Node): TOutput;

    /**
     * @inheritdoc
     *
     * @param error
     * The error to handle.
     *
     * @param item
     * The item related to the error.
     */
    public HandleError(error: Error, item: TInput): void
    {
        throw error;
    }
}
