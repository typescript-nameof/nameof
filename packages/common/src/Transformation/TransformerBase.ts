import { TransformerFeatures } from "./TransformerFeatures";

/**
 * Provides a basic implementation of a transformer.
 *
 * @template TNode
 * The type of the nodes to transform.
 *
 * @template TFeatures
 * The type of the features
 */
export class TransformerBase<TNode, TContext, TFeatures extends TransformerFeatures<TNode, TContext>>
{
    /**
     * A set of features for performing transformations.
     */
    private features: TFeatures;

    /**
     * Initializes a new instance of the {@linkcode TransformerBase TransformerBase<TNode, TFeatures>} class.
     *
     * @param features
     * A set of features for performing transformations.
     */
    public constructor(features: TFeatures)
    {
        this.features = features;
    }

    /**
     * Gets a set of features for performing transformations.
     */
    protected get Features(): TFeatures
    {
        return this.features;
    }
}
