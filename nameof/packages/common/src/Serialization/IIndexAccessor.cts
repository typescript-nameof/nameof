import { INamedPathPart } from "./INamedPathPart.cjs";
import { PathKind } from "./PathKind.cjs";

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
