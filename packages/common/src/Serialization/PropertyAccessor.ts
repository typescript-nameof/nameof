import { PathComponent } from "./PathComponent";
import { PathKind } from "./PathKind";

/**
 * Represents a property accessor.
 */
export type PropertyAccessor = PathComponent & {
    /**
     * @inheritdoc
     */
    type: PathKind.PropertyAccess;

    /**
     * The name of the property to access.
     */
    propertyName: string;
};
