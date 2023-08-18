import { IPathPart } from "./IPathPart";
import { PathKind } from "./PathKind";
import { InternalError } from "../Diagnostics/InternalError";

/**
 * Represents a path part that is unsupported.
 */
export interface IUnsupportedPath<T> extends IPathPart<T>
{
    /**
     * @inheritdoc
     */
    type: PathKind.Unsupported;

    /**
     * An error which describes the reason for the node to be unsupported.
     */
    reason?: InternalError;
}
