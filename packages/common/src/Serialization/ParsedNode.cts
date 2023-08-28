import { CallExpressionNode } from "./CallExpressionNode.cjs";
import { FunctionNode } from "./FunctionNode.cjs";
import { IdentifierNode } from "./IdentifierNode.cjs";
import { IndexAccessNode } from "./IndexAccessNode.cjs";
import { InterpolationNode } from "./InterpolationNode.cjs";
import { NumericLiteralNode } from "./NumericLiteralNode.cjs";
import { PropertyAccessNode } from "./PropertyAccessNode.cjs";
import { StringLiteralNode } from "./StringLiteralNode.cjs";
import { UnsupportedNode } from "./UnsupportedNode.cjs";

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
