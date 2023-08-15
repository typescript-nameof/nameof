import { CallExpressionNode } from "./CallExpressionNode";
import { FunctionNode } from "./FunctionNode";
import { IdentifierNode } from "./IdentifierNode";
import { IndexAccessNode } from "./IndexAccessNode";
import { InterpolationNode } from "./InterpolationNode";
import { NumericLiteralNode } from "./NumericLiteralNode";
import { PropertyAccessNode } from "./PropertyAccessNode";
import { StringLiteralNode } from "./StringLiteralNode";
import { UnsupportedNode } from "./UnsupportedNode";

/**
 * Represents a parsed node.
 */
export type ParsedNode<T> =
    IdentifierNode<T> |
    CallExpressionNode<T> |
    NumericLiteralNode<T> |
    StringLiteralNode<T> |
    PropertyAccessNode<T> |
    IndexAccessNode<T> |
    FunctionNode<T> |
    InterpolationNode<T> |
    UnsupportedNode<T>;
