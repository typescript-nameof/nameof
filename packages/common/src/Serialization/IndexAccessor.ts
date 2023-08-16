import { PathComponent } from "./PathComponent";
import { PathKind } from "./PathKind";

/**
 * Represents an index accessor.
 */
export type IndexAccessor = PathComponent & {
    /**
     * @inheritdoc
     */
    type: PathKind.IndexAccess;

    /**
     * The value of the index to access.
     */
    value: string | number;
};
