/**
 * Represents the kind of an accessor.
 */
export const enum PathKind
{
    /**
     * Indicates an unsupported path.
     */
    Unsupported = "Unsupported",

    /**
     * Indicates an identifier.
     */
    Identifier = "Identifier",

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
