import { IIdentifier } from "./IIdentifier";
import { IIndexAccessor } from "./IIndexAccessor";
import { IInterpolation } from "./IInterpolation";
import { IPropertyAccessor } from "./IPropertyAccessor";
import { UnsupportedNode } from "./UnsupportedNode";

/**
 * Represents the path of an accessor path.
 */
export type PathPart<T> =
    IIdentifier |
    IPropertyAccessor |
    IIndexAccessor |
    IInterpolation<T> |
    UnsupportedNode<T>;
