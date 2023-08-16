import { IAdapter } from "./IAdapter";
import { TransformerFeatures } from "./TransformerFeatures";
import { NameofCallExpression, Node } from "../Serialization/nodes";

/**
 * Provides the functionality to parse and dump `nameof` expressions.
 */
export abstract class Adapter<TFeatures extends TransformerFeatures<TNode, TContext>, TInput, TNode = TInput, TContext = Record<string, never>> implements IAdapter<TInput, TNode, TContext>
{
    /**
     * The features of the transformer integration.
     */
    private features: TFeatures;

    /**
     * Initializes a new instance of the {@linkcode Adapter Adapter<TFeatures, TInput, TNode, TContext>} class.
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
     * Extracts the node from the specified {@linkcode input}.
     *
     * @param input
     * The input to extract the node from.
     *
     * @returns
     * The node that was extracted from the specified {@linkcode input}.
     */
    public abstract Extract(input: TInput): TNode;

    /**
     * @inheritdoc
     *
     * @param item
     * The item to parse.
     *
     * @param context
     * The context of the operation.
     */
    public abstract LegacyParse(item: TInput, context: TContext): NameofCallExpression | undefined;

    /**
     * @inheritdoc
     *
     * @param item
     * The item to get the source code from.
     */
    public ExtractCode(item: TNode): string
    {
        throw new Error("Method not implemented.");
    }

    /**
     * @inheritdoc
     *
     * @param node
     * The node to dump.
     */
    public abstract Dump(node: Node): TNode;

    /**
     * @inheritdoc
     *
     * @param item
     * The item related to the error.
     *
     * @param context
     * The context of the operation.
     *
     * @param error
     * The error to handle.
     */
    public HandleError(item: TNode, context: TContext, error: Error): void
    {
        this.Features.ReportError(item, context, error);
    }
}
