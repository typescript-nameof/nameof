// eslint-disable-next-line node/no-unpublished-import
import { types } from "@babel/core";
import { Adapter, CallExpressionNode, NameofCallExpression, Node, ParsedNode, UnsupportedNode } from "@typescript-nameof/common";
import { ITransformTarget } from "./ITransformTarget";
import { parse } from "./parse";
import { transform } from "./transform";
import { BabelContext } from "./Transformation/BabelContext";
import { BabelFeatures } from "./Transformation/BabelFeatures";

/**
 * Provides the functionality to parse and dump `nameof` calls for babel.
 */
export class BabelAdapter extends Adapter<BabelFeatures, ITransformTarget, types.Node, BabelContext>
{
    /**
     * Initializes a new instance of the {@linkcode BabelAdapter} class.
     *
     * @param features
     * The features of the babel transformer.
     */
    public constructor(features: BabelFeatures)
    {
        super(features);
    }

    /**
     * Gets a component for handling babel types.
     */
    protected get Types(): typeof types
    {
        return this.Features.Types;
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
    public Extract(input: ITransformTarget): types.Node
    {
        return input.path.node;
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
     * The code of the specified {@linkcode item}.
     */
    public ExtractCode(item: types.Node, context: BabelContext): string
    {
        return context.state.file.code.slice(item.start as number, item.end as number);
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
     * The parsed `nameof` expression.
     */
    public LegacyParse(item: ITransformTarget, context: BabelContext): NameofCallExpression | undefined
    {
        return parse(this.Types, item.path, item.options);
    }

    /**
     * @inheritdoc
     *
     * @param node
     * The node to dump.
     *
     * @returns
     * The converted representation of the specified {@linkcode node}.
     */
    public Dump(node: Node): types.Node
    {
        return transform(this.Types, node);
    }

    /**
     * Checks whether the specified {@linkcode item} is a call expression.
     *
     * @param item
     * The item to check.
     *
     * @returns
     * A value indicating whether the specified {@linkcode item} is a call expression.
     */
    protected IsCallExpression(item: types.Node): item is types.CallExpression
    {
        return this.Types.isCallExpression(item);
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
    protected ParseInternal(item: types.Node, context: BabelContext): ParsedNode<types.Node>
    {
        if (this.IsCallExpression(item))
        {
            return new CallExpressionNode<types.Node>(
                item,
                item.callee,
                item.typeParameters?.params ?? [],
                item.arguments);
        }

        return new UnsupportedNode(item);
    }
}
