import { IIdentifier } from "./IIdentifier.cjs";
import { IIndexAccessor } from "./IIndexAccessor.cjs";
import { IInterpolation } from "./IInterpolation.cjs";
import { IPropertyAccessor } from "./IPropertyAccessor.cjs";

/**
 * Represents the path of an accessor path.
 */
export type PathPart<T> =
    IIdentifier<T> |
    IPropertyAccessor<T> |
    IIndexAccessor<T> |
    IInterpolation<T>;
