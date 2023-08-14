import { Accessor } from "./Accessor";
import { AccessorKind } from "./AccessorKind";

/**
 * Represents an interpolation.
 */
export type Interpolation<T> = Accessor & {
    /**
     * @inheritdoc
     */
    type: AccessorKind.Interpolation;

    /**
     * The interpolated node.
     */
    node: T;
};
