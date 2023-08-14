import { Accessor } from "./Accessor";
import { AccessorKind } from "./AccessorKind";

/**
 * Represents an index accessor.
 */
export type IndexAccessor = Accessor & {
    /**
     * @inheritdoc
     */
    type: AccessorKind.IndexAccess;

    /**
     * The value of the index to access.
     */
    value: string | number;
};
