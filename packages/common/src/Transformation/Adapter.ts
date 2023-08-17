import { IAdapter } from "./IAdapter";
import { TransformerFeatures } from "./TransformerFeatures";
import { CustomError } from "../Diagnostics/CustomError";
import { InvalidArgumentCountError } from "../Diagnostics/InvalidArgumentCountError";
import { NameofError } from "../Diagnostics/NameofError";
import { OutOfBoundsError } from "../Diagnostics/OutOfBoundsError";
import { UnsupportedNodeError } from "../Diagnostics/UnsupportedNodeError";
import { NameofFunction } from "../NameofFunction";
import { NameofResult } from "../NameofResult";
import { ResultType } from "../ResultType";
import { CallExpressionNode } from "../Serialization/CallExpressionNode";
import { InterpolationNode } from "../Serialization/InterpolationNode";
import { NameofCall } from "../Serialization/NameofCall";
import { NodeKind } from "../Serialization/NodeKind";
import { NameofCallExpression, Node } from "../Serialization/nodes";
import { ParsedNode } from "../Serialization/ParsedNode";
import { PathKind } from "../Serialization/PathKind";
import { PathPart } from "../Serialization/PathPart";
import { UnsupportedNode } from "../Serialization/UnsupportedNode";

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
    public abstract GetSourceCode(item: TNode, context: TContext): string;

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
    protected ParseNode(item: TNode, context: TContext): ParsedNode<TNode>
    {
        if (this.IsCallExpression(item))
        {
            let nameofCall = this.GetNameofCall(item, context);

            if (
                nameofCall &&
                nameofCall.function === NameofFunction.Interpolate)
            {
                let expectedLength = 1;

                if (nameofCall.arguments.length === expectedLength)
                {
                    return new InterpolationNode(nameofCall.source, nameofCall.arguments[0]);
                }
                else
                {
                    throw new InvalidArgumentCountError(this, nameofCall, expectedLength, context);
                }
            }
        }

        try
        {
            return this.ParseInternal(item, context);
        }
        catch (error)
        {
            if (error instanceof NameofError)
            {
                return new UnsupportedNode(item, error);
            }
            else
            {
                throw error;
            }
        }
    }

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

    /**
     * Gets the trailing name of the specified {@linkcode path}.
     *
     * @param call
     * The call which is being transformed.
     *
     * @param path
     * The path to get the name from.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The trailing name of the specified {@linkcode path}.
     */
    protected GetName(call: NameofCall<TNode>, path: Array<PathPart<TNode>>, context: TContext): NameofResult<TNode>
    {
        try
        {
            let lastNode = this.GetPath(call, path, path.length - 1, 1, context)[0];

            switch (lastNode.type)
            {
                case PathKind.Identifier:
                case PathKind.IndexAccess:
                case PathKind.PropertyAccess:
                    return {
                        type: ResultType.Plain,
                        text: `${lastNode.value}`
                    };

                default:
                    if (lastNode.type === PathKind.Unsupported && lastNode.reason)
                    {
                        throw lastNode.reason;
                    }
                    else
                    {
                        throw new UnsupportedNodeError(this, lastNode.source, context);
                    }
            }
        }
        catch (error)
        {
            if (error instanceof OutOfBoundsError)
            {
                throw new CustomError(
                    this,
                    call.source,
                    context,
                    "Unable to find an expression to get the name from.");
            }
            else
            {
                throw error;
            }
        }
    }

    /**
     * Gets the specified portion from the specified {@linkcode path}.
     *
     * @param call
     * The call which is being transformed.
     *
     * @param path
     * The path to extract the specified portion from.
     *
     * @param start
     * The index of the item to start extracting the path.
     *
     * @param count
     * The number if items to get.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The specified portion of the specified {@linkcode path}.
     */
    protected GetPath(call: NameofCall<TNode>, path: Array<PathPart<TNode>>, start: number, count: number, context: TContext): Array<PathPart<TNode>>
    {
        if (start < path.length)
        {
            let result = path.slice(start);

            if (result.length >= count)
            {
                result = result.slice(0, count);

                for (let pathPart of result)
                {
                    if (pathPart.type === PathKind.Unsupported)
                    {
                        if (pathPart.reason)
                        {
                            throw pathPart.reason;
                        }
                        else
                        {
                            throw new UnsupportedNodeError(this, pathPart.source, context);
                        }
                    }
                }

                return result;
            }
        }

        throw new OutOfBoundsError(this, call, context);
    }
}
