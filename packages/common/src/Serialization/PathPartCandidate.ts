import { IIdentifier } from "./IIdentifier";
import { IIndexAccessor } from "./IIndexAccessor";
import { IInterpolation } from "./IInterpolation";
import { IPropertyAccessor } from "./IPropertyAccessor";
import { IUnsupportedPath } from "./IUnsupportedPath";

/**
 * Represents a potential path part.
 */
export type PathPartCandidate<T> =
    IIdentifier<T> |
    IPropertyAccessor<T> |
    IIndexAccessor<T> |
    IInterpolation<T> |
    IUnsupportedPath<T>;
