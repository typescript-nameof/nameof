import { INamedPathPart } from "./INamedPathPart";
import { PathKind } from "./PathKind";

/**
 * Represents an index accessor.
 */
export interface IIndexAccessor<T> extends INamedPathPart<T, string | number>
{
    /**
     * @inheritdoc
     */
    type: PathKind.IndexAccess;
}
