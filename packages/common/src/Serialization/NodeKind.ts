/**
 * Represents the kind of a node.
 */
export const enum NodeKind
{
    /**
     * Indicates an unsupported node.
     */
    UnsupportedNode = "",

    /**
     * Indicates a numeric literal node.
     */
    NumericLiteralNode = "NumericLiteralNode",

    /**
     * Indicates a string literal node.
     */
    StringLiteralNode = "StringLiteralNode",

    /**
     * Indicates a property access node.
     */
    PropertyAccessNode = "PropertyAccessNode",

    /**
     * Indicates an index access node.
     */
    IndexAccessNode = "IndexAccessNode",

    /**
     * Indicates an interpolation node.
     */
    InterpolationNode = "InterpolationNode"
}
