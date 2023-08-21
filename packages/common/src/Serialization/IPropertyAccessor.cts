import { INamedPathPart } from "./INamedPathPart.cjs";
import { PathKind } from "./PathKind.cjs";

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
