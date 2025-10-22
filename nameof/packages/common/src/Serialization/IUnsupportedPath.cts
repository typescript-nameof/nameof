import { IPathPart } from "./IPathPart.cjs";
import { PathKind } from "./PathKind.cjs";
import { InternalError } from "../Diagnostics/InternalError.cjs";

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
     * A value indicating whether this path part was used as an index accessor.
     */
    isAccessor?: boolean;

    /**
     * An error which describes the reason for the node to be unsupported.
     */
    reason?: InternalError;
}
