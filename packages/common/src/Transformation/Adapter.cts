import { IAdapter } from "./IAdapter.cjs";
import { INodeLocation } from "./INodeLocation.cjs";
import { ITransformationContext } from "./ITransformationContext.cjs";
import { ResultBuilder } from "./ResultBuilder.cjs";
import { TransformerFeatures } from "./TransformerFeatures.cjs";
import { CustomError } from "../Diagnostics/CustomError.cjs";
import { IndexOutOfBoundsError } from "../Diagnostics/IndexOutOfBoundsError.cjs";
import { IndexParsingError } from "../Diagnostics/IndexParsingError.cjs";
import { InternalError } from "../Diagnostics/InternalError.cjs";
import { InvalidArgumentCountError } from "../Diagnostics/InvalidArgumentCountError.cjs";
import { InvalidDefaultCallError } from "../Diagnostics/InvalidDefaultCallError.cjs";
import { InvalidSegmentCallError } from "../Diagnostics/InvalidSegmentCallError.cjs";
import { MissingPropertyAccessError } from "../Diagnostics/MissingPropertyAccessError.cjs";
import { NestedNameofError } from "../Diagnostics/NestedNameofError.cjs";
import { SegmentNotFoundError } from "../Diagnostics/SegmentNotFoundError.cjs";
import { UnsupportedAccessorTypeError } from "../Diagnostics/UnsupportedAccessorTypeError.cjs";
import { UnsupportedFunctionError } from "../Diagnostics/UnsupportedFunctionError.cjs";
import { UnsupportedNodeError } from "../Diagnostics/UnsupportedNodeError.cjs";
import { UnsupportedScenarioError } from "../Diagnostics/UnsupportedScenarioError.cjs";
import { NameofFunction } from "../NameofFunction.cjs";
import { NameofResult } from "../NameofResult.cjs";
import { ResultType } from "../ResultType.cjs";
import { CallExpressionNode } from "../Serialization/CallExpressionNode.cjs";
import { FunctionNode } from "../Serialization/FunctionNode.cjs";
import { IndexAccessNode } from "../Serialization/IndexAccessNode.cjs";
import { InterpolationNode } from "../Serialization/InterpolationNode.cjs";
import { NameofCall } from "../Serialization/NameofCall.cjs";
import { NodeKind } from "../Serialization/NodeKind.cjs";
import { NumericLiteralNode } from "../Serialization/NumericLiteralNode.cjs";
import { ParsedNode } from "../Serialization/ParsedNode.cjs";
import { PathKind } from "../Serialization/PathKind.cjs";
import { PathPart } from "../Serialization/PathPart.cjs";
import { PathPartCandidate } from "../Serialization/PathPartCandidate.cjs";
import { PropertyAccessNode } from "../Serialization/PropertyAccessNode.cjs";
import { UnsupportedNode } from "../Serialization/UnsupportedNode.cjs";

/**
 * Provides the functionality to parse and dump `nameof` expressions.
 */
export abstract class Adapter<TFeatures extends TransformerFeatures<TNode, TContext>, TInput, TNode = TInput, TContext extends ITransformationContext<TNode> = ITransformationContext<TNode>> implements IAdapter<TInput, TNode, TContext>
{
    /**
     * A symbol for storing original nodes generated nodes.
     */
    private originalSymbol = Symbol("nameof-original-node");

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
     * Gets a symbol for storing original nodes generated nodes.
     */
    protected get OriginalSymbol(): symbol
    {
        return this.originalSymbol;
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
     *
     * @returns
     * A value indicating whether specified {@linkcode item} is mutated.
     */
    public IsMutated(item: TNode, context: TContext): boolean
    {
        return this.GetOriginal(item) ? true : false;
    }

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
                let result = this.ProcessNameofCall(nameofCall, context);

                if (result)
                {
                    let newNode: TNode;

                    if (Array.isArray(result))
                    {
                        newNode = this.DumpArray(result);
                    }
                    else
                    {
                        newNode = this.Dump(result);
                    }

                    this.StoreOriginal(node, newNode);
                    return newNode;
                }
            }
        }
        catch (error)
        {
            if (error instanceof InternalError)
            {
                error.ReportAction();
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
     * The item whose location to get.
     *
     * @param context
     * The context of the operation.
     */
    public abstract GetLocation(item: TNode, context: TContext): INodeLocation;

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
     * @param item
     * The item to generate the source code for.
     *
     * @param context
     * The context of the operation.
     */
    public abstract PrintSourceCode(item: TNode, context: TContext): string;

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
        this.Features.ReportError(this.GetLocation(item, context), item, context, error);
    }

    /**
     * Checks whether the specified {@linkcode item} is a call expression.
     *
     * @param item
     * The item to check.
     */
    protected abstract IsCallExpression(item: TNode): boolean;

    /**
     * Checks whether the specified {@linkcode item} is a property- or an index-accessor.
     *
     * @param item
     * The item to check.
     */
    protected abstract IsAccessExpression(item: TNode): boolean;

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
     * Stores the specified {@linkcode original} node somewhere in the {@linkcode newNode}.
     *
     * @param original
     * The node to store.
     *
     * @param newNode
     * The newly created node.
     */
    protected StoreOriginal(original: TNode, newNode: TNode): void
    {
        (newNode as any)[this.OriginalSymbol] = original;
    }

    /**
     * Gets the original node which was substituted by the specified {@linkcode node}.
     *
     * @param node
     * The node to get the original from.
     *
     * @returns
     * The original node of the specified {@linkcode node}.
     */
    protected GetOriginal(node: TNode): TNode | undefined
    {
        return (node as any)[this.OriginalSymbol];
    }

    /**
     * Gets the {@linkcode NameofCall} represented by the specified {@linkcode item}.
     *
     * @param item
     * The item to parse.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The parsed {@linkcode NameofCall} or `undefined` if no `nameof` call was found.
     */
    protected GetNameofCall(item: TNode, context: TContext): NameofCall<TNode> | undefined
    {
        if (this.IsAccessExpression(item))
        {
            let accessExpression = this.ParseInternal(item, context) as PropertyAccessNode<TNode> | IndexAccessNode<TNode>;
            let nameofCall = this.GetNameofCall(accessExpression.Expression.Source, context);

            if (
                nameofCall &&
                nameofCall.function === NameofFunction.Typed)
            {
                return {
                    ...nameofCall,
                    source: item,
                    typeArguments: [],
                    arguments: [
                        accessExpression.Source
                    ]
                };
            }
        }
        else if (this.IsCallExpression(item))
        {
            let callNode = this.ParseInternal(item, context) as CallExpressionNode<TNode>;
            let expression = this.ParseInternal(callNode.Expression, context);
            let property: string | undefined;

            if (expression.Type === NodeKind.PropertyAccessNode)
            {
                property = expression.PropertyName;
                expression = expression.Expression;
            }
            else if (
                expression.Type === NodeKind.IndexAccessNode &&
                expression.Property.Type === NodeKind.StringLiteralNode)
            {
                property = expression.Property.Text;
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
    protected ProcessNameofCall(call: NameofCall<TNode>, context: TContext): NameofResult<TNode> | Array<NameofResult<TNode>> | undefined
    {
        switch (call.function)
        {
            case undefined:
                return this.ProcessDefault(call, context);
            case NameofFunction.Typed:
                return this.ProcessTyped(call, context);
            case NameofFunction.Full:
                return this.ProcessFull(call, context);
            case NameofFunction.Split:
                return this.ProcessSplit(call, context);
            case NameofFunction.Array:
            case NameofFunction.LegacyArray:
                return this.ProcessArray(call, context);
            case NameofFunction.Interpolate:
                return this.ProcessInterpolate(call, context);
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
     * Processes the specified `nameof.typed` {@linkcode call}.
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
    protected ProcessTyped(call: NameofCall<TNode>, context: TContext): NameofResult<TNode> | undefined
    {
        if (this.IsAccessExpression(call.source))
        {
            return this.ProcessDefault(call, context);
        }
        else
        {
            return undefined;
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
                    throw new UnsupportedScenarioError(this, pathPart.source, context);
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
                    if (this.IsMutated(expression, context))
                    {
                        return {
                            type: ResultType.Node,
                            node: expression
                        };
                    }
                    else
                    {
                        throw new UnsupportedNodeError(this, expression, context);
                    }
                }
                else
                {
                    return processor(expression);
                }
            });
    }

    /**
     * Processes the specified `nameof.interpolate` {@linkcode call}.
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
    protected ProcessInterpolate(call: NameofCall<TNode>, context: TContext): undefined
    {
        // Don't transform `interpolate` functions - they will be processed in the `ProcessFull` method.
        context.interpolationCalls ??= [];
        context.interpolationCalls.push(call.source);
        return;
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
            if (error instanceof InternalError)
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
                case PathKind.PropertyAccess:
                case PathKind.IndexAccess:
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
                        else if (pathPart.isAccessor)
                        {
                            throw new UnsupportedAccessorTypeError(this, pathPart.source, context);
                        }
                        else
                        {
                            let original = this.GetOriginal(pathPart.source);

                            if (original)
                            {
                                throw new NestedNameofError(this, original, context);
                            }
                            else
                            {
                                throw new UnsupportedNodeError(this, pathPart.source, context);
                            }
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
