import { NodeKind } from "../../Serialization/NodeKind.cjs";

/**
 * Represents the kind of a state.
 */
export const enum StateKind
{
    /**
     * Indicates a template literal.
     */
    TemplateLiteral = "template",

    /**
     * Indicates an array literal.
     */
    ArrayLiteral = "array"
}

/**
 * Represents the data of a node.
 */
export type NodeData = {
    /**
     * The type of the node.
     */
    type: NodeKind | StateKind;
};

/**
 * Represents an identifier.
 */
export type Identifier = NodeData & {
    /**
     * @inheritdoc
     */
    type: NodeKind.IdentifierNode;

    /**
     * The name of the identifier.
     */
    name: string;
};

/**
 * Represents a call expression.
 */
export type CallExpression = NodeData & {
    /**
     * @inheritdoc
     */
    type: NodeKind.CallExpressionNode;

    /**
     * The expression of the call.
     */
    expression: State;

    /**
     * The arguments of the call.
     */
    arguments: State[];

    /**
     * The type arguments of the call.
     */
    typeArguments: State[];
};

/**
 * Represents a property access node.
 */
export type PropertyAccess = NodeData & {
    /**
     * @inheritdoc
     */
    type: NodeKind.PropertyAccessNode;

    /**
     * The expression of the property access.
     */
    expression: State;

    /**
     * The name of the accessed property.
     */
    propertyName: string;
};

/**
 * Represents an index access node.
 */
export type IndexAccess = NodeData & {
    /**
     * @inheritdoc
     */
    type: NodeKind.IndexAccessNode;

    /**
     * The expression of the index access.
     */
    expression: State;

    /**
     * The index that is accessed.
     */
    index: State;
};

/**
 * Represents a function node.
 */
export type FunctionData = NodeData & {
    /**
     * @inheritdoc
     */
    type: NodeKind.FunctionNode;

    /**
     * The names of the function parameters.
     */
    parameters: string[];

    /**
     * The body of the function.
     */
    body: State;
};

/**
 * Represents a string literal.
 */
export type StringLiteral = NodeData & {
    /**
     * @inheritdoc
     */
    type: NodeKind.StringLiteralNode;

    /**
     * The value of the literal.
     */
    value: string;
};

/**
 * Represents a numeric literal.
 */
export type NumericLiteral = NodeData & {
    /**
     * @inheritdoc
     */
    type: NodeKind.NumericLiteralNode;

    /**
     * The value of the literal.
     */
    value: number;
};

/**
 * Represents an interpolation.
 */
export type Interpolation = NodeData & {
    /**
     * @inheritdoc
     */
    type: NodeKind.InterpolationNode;

    /**
     * The node of the interpolation.
     */
    node: State;
};

/**
 * Represents a template literal.
 */
export type TemplateLiteral = NodeData & {
    /**
     * @inheritdoc
     */
    type: StateKind.TemplateLiteral;
};

/**
 * Represents an array literal.
 */
export type ArrayLiteral = NodeData & {
    /**
     * @inheritdoc
     */
    type: StateKind.ArrayLiteral;

    /**
     * The elements of the array.
     */
    elements: State[];
};

/**
 * Represents an unsupported node.
 */
export type Unsupported = NodeData & {
    /**
     * @inheritdoc
     */
    type: NodeKind.UnsupportedNode;
};

/**
 * Represents the state of a node.
 */
export type State =
    Identifier |
    CallExpression |
    PropertyAccess |
    IndexAccess |
    FunctionData |
    StringLiteral |
    NumericLiteral |
    Interpolation |
    TemplateLiteral |
    ArrayLiteral |
    Unsupported;
