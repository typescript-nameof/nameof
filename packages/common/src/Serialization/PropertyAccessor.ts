import { Accessor } from "./Accessor";
import { AccessorKind } from "./AccessorKind";

/**
 * Represents a property accessor.
 */
export type PropertyAccessor = Accessor & {
    /**
     * @inheritdoc
     */
    type: AccessorKind.PropertyAccess;

    /**
     * The name of the property to access.
     */
    propertyName: string;
};
