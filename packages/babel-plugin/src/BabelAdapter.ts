import babelTypes = require("@babel/types");
import { Adapter, NameofCallExpression, Node } from "@typescript-nameof/common";
import { ITransformTarget } from "./ITransformTarget";
import { parse } from "./parse";
import { transform } from "./transform";

/**
 * Provides the functionality to parse and dump `nameof` calls for babel.
 */
export class BabelAdapter extends Adapter<ITransformTarget, babelTypes.Node>
{
    /**
     * A component for handling babel types.
     */
    private types: typeof babelTypes;

    /**
     * Initializes a new instance of the {@linkcode BabelAdapter} class.
     *
     * @param types
     * A component for handling babel types.
     */
    public constructor(types: typeof babelTypes)
    {
        super();
        this.types = types;
    }

    /**
     * Gets a component for handling babel types.
     */
    protected get Types(): typeof babelTypes
    {
        return this.types;
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
    public Parse(item: ITransformTarget): NameofCallExpression | undefined
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
    public Dump(node: Node): babelTypes.Node
    {
        return transform(this.Types, node);
    }
}
