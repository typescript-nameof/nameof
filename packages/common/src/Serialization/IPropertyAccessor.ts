import { IAccessor } from "./IAccessor";
import { PathKind } from "./PathKind";

/**
 * Represents a property accessor.
 */
export interface IPropertyAccessor extends IAccessor<string>
{
    /**
     * @inheritdoc
     */
    type: PathKind.PropertyAccess;
}
