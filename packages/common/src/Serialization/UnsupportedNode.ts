import { Node } from "./Node";
import { NodeKind } from "./NodeKind";
import { PathKind } from "./PathKind";
import { PathPartCandidate } from "./PathPartCandidate";
import { InternalError } from "../Diagnostics/InternalError";

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
    private reason?: InternalError;

    /**
     * Initializes a new instance of the {@linkcode UnsupportedNode} class.
     *
     * @param source
     * The source of the node.
     *
     * @param reason
     * The reason for the node being unsupported.
     */
    public constructor(source: T, reason?: InternalError)
    {
        super(source);
        this.reason = reason;
    }

    /**
     * Gets the reason for the node being unsupported.
     */
    public get Reason(): InternalError | undefined
    {
        return this.reason;
    }

    /**
     * @inheritdoc
     */
    public override get PathPart(): PathPartCandidate<T>
    {
        return {
            type: PathKind.Unsupported,
            source: this.Source,
            reason: this.Reason
        };
    }
}
