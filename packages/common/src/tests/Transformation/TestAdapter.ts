import { Identifier, State, StateKind } from "./State.js";
import { NameofResult } from "../../NameofResult.cjs";
import { ResultType } from "../../ResultType.cjs";
import { CallExpressionNode } from "../../Serialization/CallExpressionNode.cjs";
import { FunctionNode } from "../../Serialization/FunctionNode.cjs";
import { IdentifierNode } from "../../Serialization/IdentifierNode.cjs";
import { IndexAccessNode } from "../../Serialization/IndexAccessNode.cjs";
import { InterpolationNode } from "../../Serialization/InterpolationNode.cjs";
import { NameofCall } from "../../Serialization/NameofCall.cjs";
import { NodeKind } from "../../Serialization/NodeKind.cjs";
import { NumericLiteralNode } from "../../Serialization/NumericLiteralNode.cjs";
import { ParsedNode } from "../../Serialization/ParsedNode.cjs";
import { PathPart } from "../../Serialization/PathPart.cjs";
import { PathPartCandidate } from "../../Serialization/PathPartCandidate.cjs";
import { PropertyAccessNode } from "../../Serialization/PropertyAccessNode.cjs";
import { StringLiteralNode } from "../../Serialization/StringLiteralNode.cjs";
import { UnsupportedNode } from "../../Serialization/UnsupportedNode.cjs";
import { Adapter } from "../../Transformation/Adapter.cjs";
import { INodeLocation } from "../../Transformation/INodeLocation.cjs";
import { ITransformationContext } from "../../Transformation/ITransformationContext.cjs";
import { TransformerFeatures } from "../../Transformation/TransformerFeatures.cjs";

/**
 * Provides an implementation of the {@linkcode Adapter} class for testing.
 */
export class TestAdapter extends Adapter<TransformerFeatures<State>, State>
{
    /**
     * @inheritdoc
     */
    public override get OriginalSymbol(): symbol
    {
        return super.OriginalSymbol;
    }

    /**
     * @inheritdoc
     *
     * @param input
     * The input to extract the node from.
     *
     * @returns
     * The node that was extracted from the specified {@linkcode input}.
     */
    public override Extract(input: State): State
    {
        return input;
    }

    /**
     * @inheritdoc
     *
     * @param item
     * The item whose location to get.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The location of the specified {@linkcode item}.
     */
    public override GetLocation(item: State, context: ITransformationContext<State>): INodeLocation
    {
        return {};
    }

    /**
     * @inheritdoc
     *
     * @param item
     * The item to get the source code from.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The source code of the specified {@linkcode item}.
     */
    public override GetSourceCode(item: State, context: ITransformationContext<State>): string
    {
        return "";
    }

    /**
     * @inheritdoc
     *
     * @param item
     * The item to generate the source code for.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The generated code for the specified {@linkcode item}.
     */
    public override PrintSourceCode(item: State, context: ITransformationContext<State>): string
    {
        return "";
    }

    /**
     * @inheritdoc
     *
     * @param item
     * The item to check.
     *
     * @returns
     * A value indicating whether the specified {@linkcode item} is a call expression.
     */
    public override IsCallExpression(item: State): boolean
    {
        return item.type === NodeKind.CallExpressionNode;
    }

    /**
     * @inheritdoc
     *
     * @param item
     * The item to check.
     *
     * @returns
     * A value indicating whether the specified {@linkcode item} is an accessor expression.
     */
    public override IsAccessExpression(item: State): boolean
    {
        return (
            [
                NodeKind.PropertyAccessNode,
                NodeKind.IndexAccessNode
            ] as Array<NodeKind | StateKind>).includes(item.type);
    }

    /**
     * @inheritdoc
     *
     * @param item
     * The item to check.
     *
     * @returns
     * A value indicating whether the specified {@linkcode item} is a string literal.
     */
    public override IsStringLiteral(item: State): boolean
    {
        return item.type === NodeKind.StringLiteralNode;
    }

    /**
     * @inheritdoc
     *
     * @param item
     * The item to check.
     *
     * @returns
     * A value indicating whether the specified {@linkcode item} is a template literal.
     */
    public override IsTemplateLiteral(item: State): boolean
    {
        return item.type === StateKind.TemplateLiteral;
    }

    /**
     * @inheritdoc
     *
     * @param arrayLiteral
     * The array to get the elements from.
     *
     * @returns
     * Either the elements of the {@linkcode arrayLiteral} or `undefined` if the specified {@linkcode arrayLiteral} is invalid.
     */
    public override GetArrayElements(arrayLiteral: State): State[] | undefined
    {
        if (arrayLiteral.type === StateKind.ArrayLiteral)
        {
            return arrayLiteral.elements;
        }
        else
        {
            return undefined;
        }
    }

    /**
     * @inheritdoc
     *
     * @param elements
     * The elements of the array literal to create.
     *
     * @returns
     * The newly created array literal.
     */
    public override CreateArrayLiteral(elements: State[]): State
    {
        return {
            type: StateKind.ArrayLiteral,
            elements
        };
    }

    /**
     * @inheritdoc
     *
     * @param original
     * The node to store.
     *
     * @param newNode
     * The newly created node.
     */
    public override StoreOriginal(original: State, newNode: State): void
    {
        super.StoreOriginal(original, newNode);
    }

    /**
     * @inheritdoc
     *
     * @param node
     * The node to get the original from.
     *
     * @returns
     * The original node of the specified {@linkcode node}.
     */
    public override GetOriginal(node: State): State | undefined
    {
        return super.GetOriginal(node);
    }

    /**
     * @inheritdoc
     *
     * @param node
     * The node to parse.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The parsed {@linkcode NameofCall} or `undefined` if no `nameof` call was found.
     */
    public override GetNameofCall(node: ParsedNode<State>, context: ITransformationContext<State>): NameofCall<State> | undefined
    {
        return super.GetNameofCall(node, context);
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
     * The parsed representation of the specified {@linkcode item}.
     */
    public override Parse(item: State, context: ITransformationContext<State>): ParsedNode<State>
    {
        return super.Parse(item, context);
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
     * The parsed representation of the specified {@linkcode item}.
     */
    public override ParseInternal(item: State, context: ITransformationContext<State>): ParsedNode<State>
    {
        switch (item.type)
        {
            case NodeKind.CallExpressionNode:
                return new CallExpressionNode(item, item.expression, item.typeArguments, item.arguments);
            case NodeKind.IdentifierNode:
                return new IdentifierNode(item, item.name);
            case NodeKind.PropertyAccessNode:
                return new PropertyAccessNode(
                    item,
                    this.ParseInternal(item.expression, context),
                    new IdentifierNode(
                        {
                            type: NodeKind.IdentifierNode,
                            name: item.propertyName
                        } as Identifier,
                        item.propertyName),
                    item.propertyName);
            case NodeKind.IndexAccessNode:
                return new IndexAccessNode(item, this.ParseInternal(item.expression, context), this.ParseInternal(item.index, context));
            case NodeKind.FunctionNode:
                return new FunctionNode(item, item.parameters, item.body);
            case NodeKind.StringLiteralNode:
                return new StringLiteralNode(item, item.value);
            case NodeKind.NumericLiteralNode:
                return new NumericLiteralNode(item, item.value);
            case NodeKind.InterpolationNode:
                return new InterpolationNode(item, item.node, [], []);
            default:
                return new UnsupportedNode(item);
        }
    }

    /**
     * @inheritdoc
     *
     * @param call
     * The call to get the targets from.
     *
     * @returns
     * The targets of the specified {@linkcode call}.
     */
    public override GetTargets(call: NameofCall<State>): readonly State[]
    {
        return super.GetTargets(call);
    }

    /**
     * @inheritdoc
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
    public override ProcessNameofCall(call: NameofCall<State>, context: ITransformationContext<State>): NameofResult<State> | Array<NameofResult<State>> | undefined
    {
        return super.ProcessNameofCall(call, context);
    }

    /**
     * @inheritdoc
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
    public override ProcessDefault(call: NameofCall<State>, context: ITransformationContext<State>): NameofResult<State>
    {
        return super.ProcessDefault(call, context);
    }

    /**
     * @inheritdoc
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
    public override ProcessTyped(call: NameofCall<State>, context: ITransformationContext<State>): NameofResult<State> | undefined
    {
        return super.ProcessTyped(call, context);
    }

    /**
     * @inheritdoc
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
    public override ProcessFull(call: NameofCall<State>, context: ITransformationContext<State>): NameofResult<State>
    {
        return super.ProcessFull(call, context);
    }

    /**
     * @inheritdoc
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
    public override ProcessSplit(call: NameofCall<State>, context: ITransformationContext<State>): Array<NameofResult<State>>
    {
        return super.ProcessSplit(call, context);
    }

    /**
     * @inheritdoc
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
    public override ProcessArray(call: NameofCall<State>, context: ITransformationContext<State>): Array<NameofResult<State>>
    {
        return super.ProcessArray(call, context);
    }

    /**
     * @inheritdoc
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
    public override ProcessInterpolate(call: NameofCall<State>, context: ITransformationContext<State>): undefined
    {
        return super.ProcessInterpolate(call, context);
    }

    /**
     * @inheritdoc
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
    public override ProcessSegment(call: NameofCall<State>, context: ITransformationContext<State>): Array<PathPart<State>>
    {
        return super.ProcessSegment(call, context);
    }

    /**
     * @inheritdoc
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
    public override ProcessSingle(call: NameofCall<State>, node: State, context: ITransformationContext<State>): Array<PathPartCandidate<State>>
    {
        return super.ProcessSingle(call, node, context);
    }

    /**
     * @inheritdoc
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
    public override ProcessFunctionBody(functionNode: FunctionNode<State>, node: State, context: ITransformationContext<State>): Array<PathPartCandidate<State>>
    {
        return super.ProcessFunctionBody(functionNode, node, context);
    }

    /**
     * @inheritdoc
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
    public override GetName(call: NameofCall<State>, path: Array<PathPartCandidate<State>>, context: ITransformationContext<State>): NameofResult<State>
    {
        return super.GetName(call, path, context);
    }

    /**
     * @inheritdoc
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
    public override GetPath(call: NameofCall<State>, path: Array<PathPartCandidate<State>>, index: NumericLiteralNode<State>, context: ITransformationContext<State>): Array<PathPart<State>>
    {
        return super.GetPath(call, path, index, context);
    }

    /**
     * @inheritdoc
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
    public override GetPathSegments(call: NameofCall<State>, path: Array<PathPartCandidate<State>>, start: number, count: number, context: ITransformationContext<State>): Array<PathPart<State>>
    {
        return super.GetPathSegments(call, path, start, count, context);
    }

    /**
     * @inheritdoc
     *
     * @param item
     * The item to dump.
     *
     * @returns
     * The dumped node.
     */
    public override Dump(item: NameofResult<State>): State
    {
        if (item.type === ResultType.Node)
        {
            return item.node;
        }
        else if (item.type === ResultType.Plain)
        {
            return {
                type: NodeKind.StringLiteralNode,
                value: item.text
            };
        }
        else
        {
            return { type: StateKind.TemplateLiteral };
        }
    }

    /**
     * @inheritdoc
     *
     * @param items
     * The items to dump-
     *
     * @returns
     * The newly created node.
     */
    public override DumpArray(items: Array<NameofResult<State>>): State
    {
        return super.DumpArray(items);
    }
}
