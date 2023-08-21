import { Node } from "./Node";
import { NodeKind } from "./NodeKind";
import { PathKind } from "./PathKind";
import { PathPartCandidate } from "./PathPartCandidate";

/**
 * Represents an identifier node.
 */
export class IdentifierNode<T> extends Node<T>
{
    /**
     * @inheritdoc
     */
    public readonly Type = NodeKind.IdentifierNode;

    /**
     * The name of the identifier.
     */
    private name: string;

    /**
     * Initializes a new instance of the {@linkcode IdentifierNode} class.
     *
     * @param source
     * The source of the node.
     *
     * @param name
     * The name of the identifier.
     */
    public constructor(source: T, name: string)
    {
        super(source);
        this.name = name;
    }

    /**
     * Gets the name of the identifier.
     */
    public get Name(): string
    {
        return this.name;
    }

    /**
     * @inheritdoc
     */
    public override get PathPart(): PathPartCandidate<T>
    {
        return {
            type: PathKind.Identifier,
            source: this.Source,
            value: this.Name
        };
    }
}
