import { PathKind } from "./PathKind";

/**
 * Represents a path component.
 */
export type PathComponent = {
    /**
     * The type of the path component.
     */
    type: PathKind;
};
