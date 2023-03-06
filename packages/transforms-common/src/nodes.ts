// common AST to share between babel and typescript

/**
 * Represents a `nameof` expression.
 */
export type NameofCallExpression = {
    /**
     * The property of `nameof` that is being called.
     */
    property: string | undefined;

    /**
     * The type arguments of the call.
     */
    typeArguments: Node[];

    /**
     * The arguments of the call.
     */
    arguments: Node[];
};

/**
 * Represents a node.
 */
export type Node =
    | IdentifierNode
    | StringLiteralNode
    | NumericLiteralNode
    | ArrayLiteralNode
    | ComputedNode
    | FunctionNode
    | ImportTypeNode
    | TemplateExpressionNode
    | InterpolateNode;

/**
 * Represents an identifier.
 */
export type IdentifierNode = {
    /**
     * The type of the node.
     */
    kind: "Identifier";

    /**
     * The value of the node.
     */
    value: string;

    /**
     * The next node in the chain.
     */
    next: Node | undefined;
};

/**
 * Represents a string literal.
 */
export type StringLiteralNode = {
    /**
     * The type of the node.
     */
    kind: "StringLiteral";

    /**
     * The value of the node.
     */
    value: string;

    /**
     * The next node in the chain.
     */
    next: Node | undefined;
};

/**
 * Represents a numeric literal.
 */
export type NumericLiteralNode = {
    /**
     * The type of the node.
     */
    kind: "NumericLiteral";

    /**
     * The value of the node.
     */
    value: number;

    /**
     * The next node in the chain.
     */
    next: Node | undefined;
};

/**
 * Represents an array literal.
 */
export type ArrayLiteralNode = {
    /**
     * The type of the node.
     */
    kind: "ArrayLiteral";

    /**
     * The elements of the array.
     */
    elements: Node[];

    /**
     * The next node in the chain.
     */
    next: Node | undefined;
};

/**
 * Represents a computed property access.
 */
export type ComputedNode = {
    /**
     * The type of the node.
     */
    kind: "Computed";

    /**
     * The value of the node.
     */
    value: Node;

    /**
     * The next node in the chain.
     */
    next: Node | undefined;
};

/**
 * Represents a function.
 */
export type FunctionNode = {
    /**
     * The type of the node.
     */
    kind: "Function";

    /**
     * The function parameters.
     */
    parameterNames: string[];

    /**
     * The body of the function.
     */
    value: Node;

    /**
     * The next node in the chain.
     */
    next: Node | undefined;
};

/**
 * Represents an import type.
 */
export type ImportTypeNode = {
    /**
     * The type of the node.
     */
    kind: "ImportType";

    /**
     * A value indicating whether the type is lead by the `typeof` keyword.
     */
    isTypeOf: boolean;

    /**
     * The argument of the import type.
     */
    argument: Node | undefined;

    /**
     * The next node in the chain.
     */
    next: Node | undefined;
};

/**
 * Represents a template expression.
 */
export type TemplateExpressionNode = {
    /**
     * The type of the node.
     */
    kind: "TemplateExpression";

    /**
     * The parts of the template expression.
     */
    parts: Array<string | InterpolateNode>;

    /**
     * The next node in the chain.
     */
    next: Node | undefined;
};

/**
 * Represents an interpolate call.
 */
export type InterpolateNode = {
    /**
     * The type of the node.
     */
    kind: "Interpolate";

    /**
     * The original AST.
     */
    expression: unknown;

    /**
     * The source code of the expression.
     */
    expressionText: string;

    /**
     * The next node in the chain.
     */
    next: Node | undefined;
};
