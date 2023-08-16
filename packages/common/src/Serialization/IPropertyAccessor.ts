import { INamedPathPart } from "./INamedPathPart";
import { PathKind } from "./PathKind";

/**
 * Represents a property accessor.
 */
export interface IPropertyAccessor<T> extends INamedPathPart<T, string>
{
    /**
     * @inheritdoc
     */
    type: PathKind.PropertyAccess;
}
