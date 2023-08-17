import { IAdapter } from "./IAdapter";
import { ResultBuilder } from "./ResultBuilder";
import { TransformerFeatures } from "./TransformerFeatures";
import { CustomError } from "../Diagnostics/CustomError";
import { IndexOutOfBoundsError } from "../Diagnostics/IndexOutOfBoundsError";
import { IndexParsingError } from "../Diagnostics/IndexParsingError";
import { InvalidArgumentCountError } from "../Diagnostics/InvalidArgumentCountError";
import { InvalidDefaultCallError } from "../Diagnostics/InvalidDefaultCallError";
import { InvalidSegmentCallError } from "../Diagnostics/InvalidSegmentCallError";
import { NameofError } from "../Diagnostics/NameofError";
import { SegmentNotFoundError } from "../Diagnostics/SegmentNotFoundError";
import { UnsupportedNodeError } from "../Diagnostics/UnsupportedNodeError";
import { NameofFunction } from "../NameofFunction";
import { NameofResult } from "../NameofResult";
import { ResultType } from "../ResultType";
import { CallExpressionNode } from "../Serialization/CallExpressionNode";
import { FunctionNode } from "../Serialization/FunctionNode";
import { InterpolationNode } from "../Serialization/InterpolationNode";
import { NameofCall } from "../Serialization/NameofCall";
import { NodeKind } from "../Serialization/NodeKind";
import { NameofCallExpression, Node } from "../Serialization/nodes";
import { NumericLiteralNode } from "../Serialization/NumericLiteralNode";
import { ParsedNode } from "../Serialization/ParsedNode";
import { PathKind } from "../Serialization/PathKind";
import { PathPart } from "../Serialization/PathPart";
import { PathPartCandidate } from "../Serialization/PathPartCandidate";
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
    public ReportError(item: TNode, context: TContext, error: Error): void
    {
        this.Features.ReportError(item, context, error);
    }

    /**
     * Checks whether the specified {@linkcode item} is a call expression.
     *
     * @param item
     * The item to check.
     */
    protected abstract IsCallExpression(item: TNode): boolean;

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
     * Gets the targets of the specified `nameof` {@linkcode call}.
     *
     * @param call
     * The call to get the targets from.
     *
     * @returns
     * The targets of the specified {@linkcode call}.
     */
    protected GetTargets(call: NameofCall<TNode>): readonly TNode[]
    {
        if (call.arguments.length > 0)
        {
            return call.arguments;
        }
        else
        {
            return call.typeArguments;
        }
    }

    /**
     * Transforms the specified `nameof` {@linkcode call}.
     *
     * @param call
     * The call to transform.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The parsed representation of the specified {@linkcode call}.
     */
    protected TransformDefault(call: NameofCall<TNode>, context: TContext): NameofResult<TNode>
    {
        let targets = this.GetTargets(call);

        if (targets.length === 1)
        {
            return this.GetName(call, this.TransformSingle(call, targets[0], context), context);
        }
        else
        {
            throw new InvalidDefaultCallError(this, call, context);
        }
    }

    /**
     * Transforms the specified `nameof.full` {@linkcode call}.
     *
     * @param call
     * The call to transform.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The parsed representation of the specified {@linkcode call}.
     */
    protected TransformFull(call: NameofCall<TNode>, context: TContext): NameofResult<TNode>
    {
        let path = this.TransformSegment(call, context);
        let resultBuilder = new ResultBuilder(this, context);

        for (let pathPart of path)
        {
            resultBuilder.Add(pathPart);
        }

        return resultBuilder.Result;
    }

    /**
     * Transforms the specified `nameof.split` {@linkcode call}.
     *
     * @param call
     * The call to transform.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The parsed representation of the specified {@linkcode call}.
     */
    protected TransformSplit(call: NameofCall<TNode>, context: TContext): Array<NameofResult<TNode>>
    {
        let path = this.TransformSegment(call, context);
        let result: Array<NameofResult<TNode>> = [];

        for (let pathPart of path)
        {
            switch (pathPart.type)
            {
                case PathKind.Interpolation:
                    throw new UnsupportedNodeError(this, pathPart.source, context);
                default:
                    result.push(
                        {
                            type: ResultType.Plain,
                            text: `${pathPart.value}`
                        });
            }
        }

        return result;
    }

    /**
     * Transforms a segment of the specified {@linkcode call}.
     *
     * @param call
     * The call to transform.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The transformed call.
     */
    protected TransformSegment(call: NameofCall<TNode>, context: TContext): Array<PathPart<TNode>>
    {
        let index: NumericLiteralNode<TNode> | undefined;
        let expression: TNode;

        if (call.arguments.length === 0)
        {
            if (call.typeArguments.length === 1)
            {
                expression = call.typeArguments[0];
            }
            else
            {
                throw new InvalidSegmentCallError(this, call, context);
            }
        }
        else if (call.arguments.length === 1)
        {
            if (call.typeArguments.length === 0)
            {
                expression = call.arguments[0];
            }
            else if (call.typeArguments.length === 1)
            {
                let parsedArgument = this.ParseNode(call.arguments[0], context);

                if (parsedArgument.Type === NodeKind.NumericLiteralNode)
                {
                    index = parsedArgument;
                    expression = call.typeArguments[0];
                }
                else
                {
                    expression = call.arguments[0];
                }
            }
            else
            {
                throw new InvalidSegmentCallError(this, call, context);
            }
        }
        else if (call.arguments.length === 2)
        {
            let parsedNode = this.ParseNode(call.arguments[1], context);

            if (parsedNode.Type === NodeKind.NumericLiteralNode)
            {
                index = parsedNode;
                expression = call.arguments[0];
            }
            else
            {
                throw new IndexParsingError(this, parsedNode.Source, context);
            }
        }
        else
        {
            throw new InvalidSegmentCallError(this, call, context);
        }

        let path = this.TransformSingle(call, expression, context);

        if (index)
        {
            return this.GetPath(call, path, index, context);
        }
        else
        {
            return this.GetPathSegments(call, path, 0, path.length, context);
        }
    }

    /**
     * Transforms the specified {@linkcode call}.
     *
     * @param call
     * The call to transform.
     *
     * @param node
     * The node to transform.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The transformed call.
     */
    protected TransformSingle(call: NameofCall<TNode>, node: TNode, context: TContext): Array<PathPartCandidate<TNode>>
    {
        let result = this.ParseNode(node, context);

        if (result.Type === NodeKind.FunctionNode)
        {
            return this.TransformFunctionBody(result, result.Body, context);
        }
        else
        {
            return result.Path;
        }
    }

    /**
     * Transforms the specified {@linkcode node}.
     *
     * @param functionNode
     * The function of the node to transform.
     *
     * @param node
     * The node to transform.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The transformed representation of the specified {@linkcode node}.
     */
    protected TransformFunctionBody(functionNode: FunctionNode<TNode>, node: TNode, context: TContext): Array<PathPartCandidate<TNode>>
    {
        let path = this.ParseNode(node, context).Path;

        if (
            path[0].type === PathKind.Identifier &&
            functionNode.Parameters.includes(path[0].value))
        {
            path.splice(0, 1);

            if (path.length === 0)
            {
                throw new Error(); // TODO: Throw error stating that no property was accessed.
            }
        }

        return path;
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
    protected GetName(call: NameofCall<TNode>, path: Array<PathPartCandidate<TNode>>, context: TContext): NameofResult<TNode>
    {
        try
        {
            let lastNode = this.GetPathSegments(call, path, path.length - 1, 1, context)[0];

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
                    throw new UnsupportedNodeError(this, lastNode.source, context);
            }
        }
        catch (error)
        {
            if (error instanceof SegmentNotFoundError)
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
     * Extracts a portion of the specified {@linkcode path} according to the specified {@linkcode index}.
     *
     * @param call
     * The call which is being transformed.
     *
     * @param path
     * The path to extract the portion from.
     *
     * @param index
     * The index of the element to start the extraction from.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * A portion of the specified {@linkcode path} according to the specified {@linkcode index}.
     */
    protected GetPath(call: NameofCall<TNode>, path: Array<PathPartCandidate<TNode>>, index: NumericLiteralNode<TNode>, context: TContext): Array<PathPart<TNode>>
    {
        if (Math.abs(index.Value) > path.length)
        {
            throw new IndexOutOfBoundsError(this, index, path.length, context);
        }
        else
        {
            let startIndex: number;
            let count: number;

            if (index.Value >= 0)
            {
                startIndex = index.Value;
                count = path.length - startIndex;
            }
            else
            {
                startIndex = path.length + index.Value;
                count = -index.Value;
            }

            return this.GetPathSegments(call, path, startIndex, count, context);
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
    protected GetPathSegments(call: NameofCall<TNode>, path: Array<PathPartCandidate<TNode>>, start: number, count: number, context: TContext): Array<PathPart<TNode>>
    {
        if (start < path.length)
        {
            let result: Array<PathPart<TNode>> = [];
            let candidates = path.slice(start);

            if (candidates.length >= count)
            {
                candidates = candidates.slice(0, count);

                for (let pathPart of candidates)
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
                    else
                    {
                        result.push(pathPart);
                    }
                }

                return result;
            }
        }

        throw new SegmentNotFoundError(this, call, context);
    }
}
