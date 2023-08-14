import { IndexAccessor } from "./IndexAccessor";
import { Interpolation } from "./Interpolation";
import { PropertyAccessor } from "./PropertyAccessor";
import { UnsupportedNode } from "./UnsupportedNode";

/**
 * Represents the path of an accessor path.
 */
export type PathPart<T> =
    PropertyAccessor |
    IndexAccessor |
    Interpolation<T> |
    UnsupportedNode<T>;
