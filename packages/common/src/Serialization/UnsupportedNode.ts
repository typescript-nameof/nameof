import { Node } from "./Node";
import { NodeKind } from "./NodeKind";

/**
 * Represents an unsupported node.
 */
export class UnsupportedNode<T> extends Node<T>
{
    /**
     * @inheritdoc
     */
    public readonly Type = NodeKind.UnsupportedNode;

    /**
     * Initializes a new instance of the {@linkcode UnsupportedNode} class.
     *
     * @param source
     * The source of the node.
     */
    public constructor(source: T)
    {
        super(source);
    }
}
