import { IIdentifier } from "./IIdentifier";
import { IIndexAccessor } from "./IIndexAccessor";
import { IInterpolation } from "./IInterpolation";
import { IPropertyAccessor } from "./IPropertyAccessor";
import { IUnsupportedPath } from "./IUnsupportedPath";

/**
 * Represents the path of an accessor path.
 */
export type PathPart<T> =
    IIdentifier<T> |
    IPropertyAccessor<T> |
    IIndexAccessor<T> |
    IInterpolation<T> |
    IUnsupportedPath<T>;
