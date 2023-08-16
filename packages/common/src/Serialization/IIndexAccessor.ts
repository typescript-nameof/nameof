import { INamedPathPart } from "./INamedPathPart";
import { PathKind } from "./PathKind";

/**
 * Represents an index accessor.
 */
export interface IIndexAccessor extends INamedPathPart<string | number>
{
    /**
     * @inheritdoc
     */
    type: PathKind.IndexAccess;
}
