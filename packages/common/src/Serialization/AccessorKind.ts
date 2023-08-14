/**
 * Represents the kind of an accessor.
 */
export const enum AccessorKind
{
    /**
     * Indicates a property access.
     */
    PropertyAccess = "PropertyAccess",

    /**
     * Indicates an index access.
     */
    IndexAccess = "IndexAccess",

    /**
     * Indicates an interpolation.
     */
    Interpolation = "Interpolation"
}
