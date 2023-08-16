import { IPathPart } from "./IPathPart";
import { PathKind } from "./PathKind";

/**
 * Represents a path part that is unsupported.
 */
export interface IUnsupportedPath<T> extends IPathPart<T>
{
    /**
     * @inheritdoc
     */
    type: PathKind.Unsupported;
}
