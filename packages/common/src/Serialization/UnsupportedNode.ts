import { Node } from "./Node";
import { NodeKind } from "./NodeKind";
import { PathKind } from "./PathKind";
import { PathPart } from "./PathPart";
import { NameofError } from "../Diagnostics/NameofError";

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
     * The reason for the node being unsupported.
     */
    private reason?: NameofError;

    /**
     * Initializes a new instance of the {@linkcode UnsupportedNode} class.
     *
     * @param source
     * The source of the node.
     *
     * @param reason
     * The reason for the node being unsupported.
     */
    public constructor(source: T, reason?: NameofError)
    {
        super(source);
        this.reason = reason;
    }

    /**
     * Gets the reason for the node being unsupported.
     */
    public get Reason(): NameofError | undefined
    {
        return this.reason;
    }

    /**
     * @inheritdoc
     */
    public get PathPart(): PathPart<T>
    {
        return {
            type: PathKind.Unsupported,
            source: this.Source,
            reason: this.Reason
        };
    }
}
