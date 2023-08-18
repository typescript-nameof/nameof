import { IAdapter } from "./IAdapter";
import { ResultBuilder } from "./ResultBuilder";
import { TransformerFeatures } from "./TransformerFeatures";
import { CustomError } from "../Diagnostics/CustomError";
import { IndexOutOfBoundsError } from "../Diagnostics/IndexOutOfBoundsError";
import { IndexParsingError } from "../Diagnostics/IndexParsingError";
import { InvalidArgumentCountError } from "../Diagnostics/InvalidArgumentCountError";
import { InvalidDefaultCallError } from "../Diagnostics/InvalidDefaultCallError";
import { InvalidSegmentCallError } from "../Diagnostics/InvalidSegmentCallError";
import { MissingPropertyAccessError } from "../Diagnostics/MissingPropertyAccessError";
import { NameofError } from "../Diagnostics/NameofError";
import { SegmentNotFoundError } from "../Diagnostics/SegmentNotFoundError";
import { UnsupportedFunctionError } from "../Diagnostics/UnsupportedFunctionError";
import { UnsupportedNodeError } from "../Diagnostics/UnsupportedNodeError";
import { UnsupportedScenarioError } from "../Diagnostics/UnsupportedScenarioError";
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
     * A symbol for marking visited nodes.
     */
    private markerSymbol = Symbol("nameof-visited-node");

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
     * Gets a symbol for marking visited nodes.
     */
    protected get MarkerSymbol(): symbol
    {
        return this.markerSymbol;
    }

    /**
     * @inheritdoc
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The expected name of function calls.
     */
    public GetNameofName(context: TContext): string
    {
        return "nameof";
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
     * The item to check.
     *
     * @param context
     * The context of the operation.
     */
    public abstract IsMutated(item: TNode, context: TContext): boolean;

    /**
     * @inheritdoc
     *
     * @param input
     * The item to transform.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The transformed node.
     */
    public Transform(input: TInput, context: TContext): TNode
    {
        let node = this.Extract(input);

        try
        {
            let nameofCall = this.GetNameofCall(node, context);

            if (nameofCall)
            {
                let node: TNode;
                let result = this.ProcessNameofCall(nameofCall, context);

                if (Array.isArray(result))
                {
                    node = this.DumpArray(result);
                }
                else
                {
                    node = this.Dump(result);
                }

                this.MarkNode(node);
                return node;
            }
        }
        catch (error)
        {
            if (error instanceof NameofError)
            {
                error.Action();
            }
            else
            {
                let newError: Error;

                if (error instanceof Error)
                {
                    newError = error;
                }
                else
                {
                    newError = new Error(`${error}`);
                }

                this.ReportError(node, context, newError);
            }
        }

        return node;
    }

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
    public abstract LegacyDump(node: Node): TNode;

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
     * Checks whether the specified {@linkcode item} is a string literal.
     *
     * @param item
     * The item to check.
     */
    protected abstract IsStringLiteral(item: TNode): boolean;

    /**
     * Checks whether the specified {@linkcode item} is a template literal.
     *
     * @param item
     * The item to check.
     */
    protected abstract IsTemplateLiteral(item: TNode): boolean;

    /**
     * Gets the elements from the specified {@linkcode arrayLiteral}.
     *
     * @param arrayLiteral
     * The array to get the elements from.
     *
     * @returns
     * Either the elements of the {@linkcode arrayLiteral} or `undefined` if the specified {@linkcode arrayLiteral} is invalid.
     */
    protected abstract GetArrayElements(arrayLiteral: TNode): TNode[] | undefined;

    /**
     * Creates an array literal node with the specified {@linkcode elements}.
     *
     * @param elements
     * The elements of the array literal to create.
     */
    protected abstract CreateArrayLiteral(elements: TNode[]): TNode;

    /**
     * Marks the specified {@linkcode node} as mutated by `nameof`.
     *
     * @param node
     * The node to mark as processed.
     */
    protected abstract MarkNode(node: TNode): void;

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
                expression.Name === this.GetNameofName(context))
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
     * The transformed call.
     */
    protected ProcessNameofCall(call: NameofCall<TNode>, context: TContext): NameofResult<TNode> | Array<NameofResult<TNode>>
    {
        switch (call.function)
        {
            case undefined:
                return this.ProcessDefault(call, context);
            case NameofFunction.Full:
                return this.ProcessFull(call, context);
            case NameofFunction.Split:
                return this.ProcessSplit(call, context);
            case NameofFunction.Array:
                return this.ProcessArray(call, context);
            // Don't transform `interpolate` functions - they will be processed in the `ProcessFull` method.
            case NameofFunction.Interpolate:
                return {
                    type: ResultType.Node,
                    node: call.source
                };
            default:
                throw new UnsupportedFunctionError(this, call, context);
        }
    }

    /**
     * Processes the specified `nameof` {@linkcode call}.
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
    protected ProcessDefault(call: NameofCall<TNode>, context: TContext): NameofResult<TNode>
    {
        let targets = this.GetTargets(call);

        if (targets.length === 1)
        {
            return this.GetName(call, this.ProcessSingle(call, targets[0], context), context);
        }
        else
        {
            throw new InvalidDefaultCallError(this, call, context);
        }
    }

    /**
     * Processes the specified `nameof.full` {@linkcode call}.
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
    protected ProcessFull(call: NameofCall<TNode>, context: TContext): NameofResult<TNode>
    {
        let path = this.ProcessSegment(call, context);
        let resultBuilder = new ResultBuilder(this, context);

        for (let pathPart of path)
        {
            resultBuilder.Add(pathPart);
        }

        return resultBuilder.Result;
    }

    /**
     * Processes the specified `nameof.split` {@linkcode call}.
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
    protected ProcessSplit(call: NameofCall<TNode>, context: TContext): Array<NameofResult<TNode>>
    {
        let path = this.ProcessSegment(call, context);
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
     * Processes the specified `nameof.toArray` {@linkcode call}.
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
    protected ProcessArray(call: NameofCall<TNode>, context: TContext): Array<NameofResult<TNode>>
    {
        let expressions: readonly TNode[] = call.arguments;

        let processor = (node: TNode): NameofResult<TNode> =>
        {
            return this.GetName(call, this.ParseNode(node, context).Path, context);
        };

        if (call.arguments.length === 1)
        {
            let parsedNode = this.ParseNode(call.arguments[0], context);

            if (parsedNode.Type === NodeKind.FunctionNode)
            {
                let functionNode = parsedNode;
                let elements = this.GetArrayElements(parsedNode.Body);

                if (elements)
                {
                    expressions = elements;

                    processor = (node) =>
                    {
                        return this.GetName(call, this.ProcessFunctionBody(functionNode, node, context), context);
                    };

                    return elements.map(
                        (expression) =>
                        {
                            if (
                                this.IsMutated(expression, context) && (
                                    this.IsStringLiteral(expression) ||
                                    this.IsTemplateLiteral(expression)))
                            {
                                return {
                                    type: ResultType.Node,
                                    node: expression
                                };
                            }
                            else
                            {
                                return this.GetName(call, this.ProcessFunctionBody(functionNode, expression, context), context);
                            }
                        });
                }
            }
        }

        return expressions.map(
            (expression): NameofResult<TNode> =>
            {
                if (
                    this.IsStringLiteral(expression) ||
                    this.IsTemplateLiteral(expression))
                {
                    return {
                        type: ResultType.Node,
                        node: expression
                    };
                }
                else
                {
                    return processor(expression);
                }
            });
    }

    /**
     * Processes a segment of the specified {@linkcode call}.
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
    protected ProcessSegment(call: NameofCall<TNode>, context: TContext): Array<PathPart<TNode>>
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

        let path = this.ProcessSingle(call, expression, context);

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
     * Processes the specified {@linkcode call}.
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
    protected ProcessSingle(call: NameofCall<TNode>, node: TNode, context: TContext): Array<PathPartCandidate<TNode>>
    {
        let result = this.ParseNode(node, context);

        if (result.Type === NodeKind.FunctionNode)
        {
            return this.ProcessFunctionBody(result, result.Body, context);
        }
        else
        {
            return result.Path;
        }
    }

    /**
     * Processes the specified {@linkcode node}.
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
    protected ProcessFunctionBody(functionNode: FunctionNode<TNode>, node: TNode, context: TContext): Array<PathPartCandidate<TNode>>
    {
        let path = this.ParseNode(node, context).Path;

        if (
            path[0].type === PathKind.Identifier &&
            functionNode.Parameters.includes(path[0].value))
        {
            path.splice(0, 1);

            if (path.length === 0)
            {
                throw new MissingPropertyAccessError(this, node, context);
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
     * Dumps the specified {@linkcode item}.
     *
     * @param item
     * The item to dump.
     */
    protected abstract Dump(item: NameofResult<TNode>): TNode;

    /**
     * Dumps the specified {@linkcode items}.
     *
     * @param items
     * The items to dump-
     *
     * @returns
     * The newly created node.
     */
    protected DumpArray(items: Array<NameofResult<TNode>>): TNode
    {
        return this.CreateArrayLiteral(items.map((item) => this.Dump(item)));
    }

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

                case PathKind.Interpolation:
                    throw new UnsupportedScenarioError(this, lastNode.source, context);
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
