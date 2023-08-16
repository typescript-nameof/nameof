// eslint-disable-next-line node/no-unpublished-import
import { types } from "@babel/core";
import { Adapter, NameofCallExpression, Node } from "@typescript-nameof/common";
import { ITransformTarget } from "./ITransformTarget";
import { parse, ParseOptions } from "./parse";
import { transform } from "./transform";
import { BabelFeatures } from "./Transformation/BabelFeatures";

/**
 * Provides the functionality to parse and dump `nameof` calls for babel.
 */
export class BabelAdapter extends Adapter<BabelFeatures, ITransformTarget, types.Node, ParseOptions>
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
     * @param item
     * The item to parse.
     *
     * @returns
     * The parsed `nameof` expression.
     */
    public LegacyParse(item: ITransformTarget): NameofCallExpression | undefined
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
}
