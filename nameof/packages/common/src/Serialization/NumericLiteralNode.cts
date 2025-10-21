import { Node } from "./Node.cjs";
import { NodeKind } from "./NodeKind.cjs";

/**
 * Represents a numeric literal node.
 */
export class NumericLiteralNode<T> extends Node<T>
{
    /**
     * @inheritdoc
     */
    public readonly Type = NodeKind.NumericLiteralNode;

    /**
     * The value of the node.
     */
    private value: number;

    /**
     * Initializes a new instance of the {@linkcode NumericLiteralNode} class.
     *
     * @param source
     * The source of the node.
     *
     * @param value
     * The value of the node.
     */
    public constructor(source: T, value: number)
    {
        super(source);
        this.value = value;
    }

    /**
     * Gets the value of the node.
     */
    public get Value(): number
    {
        return this.value;
    }
}
