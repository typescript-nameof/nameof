import { PathComponent } from "./PathComponent";
import { PathKind } from "./PathKind";

/**
 * Represents an interpolation.
 */
export type Interpolation<T> = PathComponent & {
    /**
     * @inheritdoc
     */
    type: PathKind.Interpolation;

    /**
     * The interpolated node.
     */
    node: T;
};
