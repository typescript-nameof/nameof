import { IAdapter } from "./IAdapter";
import { TransformerFeatures } from "./TransformerFeatures";
import { CallExpressionNode } from "../Serialization/CallExpressionNode";
import { NameofCall } from "../Serialization/NameofCall";
import { NodeKind } from "../Serialization/NodeKind";
import { NameofCallExpression, Node } from "../Serialization/nodes";
import { ParsedNode } from "../Serialization/ParsedNode";

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
     *
     * @param context
     * The context of the operation.
     */
    public abstract ExtractCode(item: TNode, context: TContext): string;

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

    /**
     * @inheritdoc
     *
     * @param item
     * The item to parse.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The parsed {@linkcode NameofCall} or `code` if no `nameof` call was found.
     */
    protected GetNameofCall(item: TNode, context: TContext): NameofCall<TNode> | undefined
    {
        if (this.IsCallExpression(item))
        {
            let callNode = this.ParseInternal(item, context) as CallExpressionNode<TNode>;
            let expression = this.ParseInternal(callNode.Expression, context);
            let property: string | undefined;

            if (expression.Type === NodeKind.PropertyAccessNode)
            {
                property = expression.PropertyName;
                expression = expression.Expression;
            }

            if (
                expression.Type === NodeKind.IdentifierNode &&
                expression.Name === "nameof")
            {
                return {
                    source: item,
                    function: property,
                    typeArguments: callNode.TypeArguments,
                    arguments: callNode.Arguments
                };
            }
        }

        return undefined;
    }

    /**
     * Checks whether the specified {@linkcode item} is a call expression.
     *
     * @param item
     * The item to check.
     */
    protected abstract IsCallExpression(item: TNode): boolean;

    /**
     * Parses the specified {@linkcode item}.
     *
     * @param item
     * The item to parse.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The parsed representation of the specified {@linkcode item}.
     */
    protected abstract ParseInternal(item: TNode, context: TContext): ParsedNode<TNode>;
}
