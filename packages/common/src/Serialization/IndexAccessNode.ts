import { Node } from "./Node";
import { NodeKind } from "./NodeKind";
import { ParsedNode } from "./ParsedNode";
import { PathKind } from "./PathKind";
import { PathPart } from "./PathPart";
import { UnsupportedNode } from "./UnsupportedNode";

/**
 * Represents an index access node.
 */
export class IndexAccessNode<T> extends Node<T>
{
    /**
     * @inheritdoc
     */
    public readonly Type = NodeKind.IndexAccessNode;

    /**
     * The expression of the index access operation.
     */
    private expression: Node<T>;

    /**
     * The index to access.
     */
    private index: ParsedNode<T>;

    /**
     * Initializes a new instance of the {@linkcode IndexAccessNode} class.
     *
     * @param source
     * The source of the node.
     *
     * @param expression
     * The expression of the index access operation.
     *
     * @param index
     * The index to access.
     */
    public constructor(source: T, expression: Node<T>, index: ParsedNode<T>)
    {
        super(source);
        this.expression = expression;
        this.index = index;
    }

    /**
     * Gets the expression of the index access operation.
     */
    public get Expression(): Node<T>
    {
        return this.expression;
    }

    /**
     * Gets the index to access.
     */
    public get Index(): ParsedNode<T>
    {
        return this.index;
    }

    /**
     * @inheritdoc
     */
    public override get PathPart(): PathPart<T>
    {
        let source = this.Index.Source;

        switch (this.Index.Type)
        {
            case NodeKind.NumericLiteralNode:
            case NodeKind.StringLiteralNode:
                let value: string | number;

                if (this.Index.Type === NodeKind.NumericLiteralNode)
                {
                    value = this.Index.Value;
                }
                else
                {
                    value = this.Index.Text;
                }

                return {
                    type: PathKind.IndexAccess,
                    source,
                    value
                };
            case NodeKind.InterpolationNode:
                return {
                    type: PathKind.Interpolation,
                    source,
                    node: this.Index.Expression
                };
            default:
                return new UnsupportedNode(this.Index.Source);
        }
    }

    /**
     * @inheritdoc
     */
    public override get Path(): Array<PathPart<T>>
    {
        return [
            ...this.Expression.Path,
            this.PathPart
        ];
    }

    /**
     * @inheritdoc
     */
    public override get Root(): ParsedNode<T>
    {
        return this.Expression.Root;
    }
}
