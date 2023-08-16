import { IAccessor } from "./IAccessor";
import { PathKind } from "./PathKind";

/**
 * Represents an index accessor.
 */
export interface IIndexAccessor extends IAccessor<string | number>
{
    /**
     * @inheritdoc
     */
    type: PathKind.IndexAccess;
}
