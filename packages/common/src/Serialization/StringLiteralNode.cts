import { Node } from "./Node.cjs";
import { NodeKind } from "./NodeKind.cjs";

/**
 * Represents a string literal node.
 */
export class StringLiteralNode<T> extends Node<T>
{
    /**
     * @inheritdoc
     */
    public readonly Type = NodeKind.StringLiteralNode;

    /**
     * The text of the node.
     */
    private text: string;

    /**
     * Initializes a new instance of the {@linkcode StringLiteralNode} class.
     *
     * @param source
     * The source of the node.
     *
     * @param text
     * The text of the node.
     */
    public constructor(source: T, text: string)
    {
        super(source);
        this.text = text;
    }

    /**
     * Gets the text of the node.
     */
    public get Text(): string
    {
        return this.text;
    }
}
