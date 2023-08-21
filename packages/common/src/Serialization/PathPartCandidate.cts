import { IIdentifier } from "./IIdentifier.cjs";
import { IIndexAccessor } from "./IIndexAccessor.cjs";
import { IInterpolation } from "./IInterpolation.cjs";
import { IPropertyAccessor } from "./IPropertyAccessor.cjs";
import { IUnsupportedPath } from "./IUnsupportedPath.cjs";

/**
 * Represents a potential path part.
 */
export type PathPartCandidate<T> =
    IIdentifier<T> |
    IPropertyAccessor<T> |
    IIndexAccessor<T> |
    IInterpolation<T> |
    IUnsupportedPath<T>;
