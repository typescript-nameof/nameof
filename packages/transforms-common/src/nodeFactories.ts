import
    {
        ArrayLiteralNode,
        ComputedNode,
        FunctionNode,
        IdentifierNode,
        ImportTypeNode,
        InterpolateNode,
        Node,
        NumericLiteralNode,
        StringLiteralNode,
        TemplateExpressionNode
    } from "./nodes";

/**
 * Creates an identifier.
 *
 * @param value
 * The name of the identifier.
 *
 * @param next
 * The next node in the chain.
 *
 * @returns
 * The newly created node.
 */
export function createIdentifierNode(value: string, next?: Node | undefined): IdentifierNode
{
    return {
        kind: "Identifier",
        value,
        next
    };
}

/**
 * Creates a string literal.
 *
 * @param value
 * The value of the string literal.
 *
 * @param next
 * The next node in the chain.
 *
 * @returns
 * The newly created node.
 */
export function createStringLiteralNode(value: string, next?: Node | undefined): StringLiteralNode
{
    return {
        kind: "StringLiteral",
        value,
        next
    };
}

/**
 * Creates a numeric literal.
 *
 * @param value
 * The value of the numeric literal.
 *
 * @param next
 * The next node in the chain.
 *
 * @returns
 * The newly created node.
 */
export function createNumericLiteralNode(value: number, next?: Node | undefined): NumericLiteralNode
{
    return {
        kind: "NumericLiteral",
        value,
        next
    };
}

/**
 * Creates an array literal.
 *
 * @param elements
 * The elements of the array literal.
 *
 * @param next
 * The next node in the chain.
 *
 * @returns
 * The newly created node.
 */
export function createArrayLiteralNode(elements: ArrayLiteralNode["elements"], next?: Node | undefined): ArrayLiteralNode
{
    return {
        kind: "ArrayLiteral",
        elements,
        next
    };
}

/**
 * Creates a computed property accessor.
 *
 * @param value
 * The expression of the computed property accessor.
 *
 * @param next
 * The next node in the chain.
 *
 * @returns
 * The newly created node.
 */
export function createComputedNode(value: Node, next?: Node | undefined): ComputedNode
{
    return {
        kind: "Computed",
        value,
        next
    };
}

/**
 * Creates a function.
 *
 * @param value
 * The body of the function.
 *
 * @param parameterNames
 * The name of the parameters.
 *
 * @param next
 * The next node in the chain.
 *
 * @returns
 * The newly created node.
 */
export function createFunctionNode(value: Node, parameterNames: string[], next?: Node | undefined): FunctionNode
{
    return {
        kind: "Function",
        parameterNames,
        value,
        next
    };
}

/**
 * Creates an import type.
 *
 * @param isTypeOf
 * A value indicating whether the type is lead by a `typeof` keyword.
 *
 * @param argument
 * The argument of the import type.
 *
 * @param next
 * The next node in the chain.
 *
 * @returns
 * The newly created node.
 */
export function createImportTypeNode(isTypeOf: boolean, argument: Node | undefined, next?: Node | undefined): ImportTypeNode
{
    return {
        kind: "ImportType",
        isTypeOf,
        argument,
        next
    };
}

/**
 * Creates a template expression.
 *
 * @param parts
 * The parts of the template expression.
 *
 * @param next
 * The next node in the chain.
 *
 * @returns
 * The newly created node.
 */
export function createTemplateExpressionNode(parts: Array<string | InterpolateNode>, next?: Node | undefined): TemplateExpressionNode
{
    return {
        kind: "TemplateExpression",
        parts,
        next
    };
}

/**
 * Creates an `interpolate` call.
 *
 * @param expression
 * The expression of the interpolate call.
 *
 * @param expressionText
 * The source code of the expression.
 *
 * @param next
 * The next node in the chain.
 *
 * @returns
 * The newly created node.
 */
export function createInterpolateNode(expression: unknown, expressionText: string, next?: Node | undefined): InterpolateNode
{
    return {
        kind: "Interpolate",
        expression,
        expressionText,
        next
    };
}
