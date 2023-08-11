// eslint-disable-next-line node/no-unpublished-import
import type { types } from "@babel/core";
import type { NodePath } from "@babel/traverse";
import type {
    ArrayExpression,
    ArrowFunctionExpression,
    BlockStatement,
    CallExpression,
    Expression,
    FunctionExpression,
    Identifier,
    MemberExpression,
    Node,
    NumericLiteral,
    StringLiteral,
    TemplateLiteral,
    TSImportType,
    TSQualifiedName,
    TSTypeParameterInstantiation,
    UnaryExpression,
    V8IntrinsicIdentifier
} from "@babel/types";
import common = require("@typescript-nameof/common");
import { getNegativeNumericLiteralValue, getReturnStatementArgumentFromBlock, isNegativeNumericLiteral } from "./helpers";

/**
 * Provides options for parsing babel nodes.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface ParseOptions
{
    /**
     * Action to prompt the children to be traversed. This is to allow traversing the nodes in post order.
     */
    traverseChildren?: () => void;

    /**
     * Expected identifier name at the start of the call expression. This could be different when using a macro.
     *
     * @default "nameof"
     */
    nameofIdentifierName?: string;
}

/**
 * Parses the babel node located at the specified {@link path `path`}.
 *
 * @param t
 * A component for handling babel types.
 *
 * @param path
 * The path to the node to parse.
 *
 * @param options
 * The options for parsing the node.
 *
 * @returns
 * The parsed node.
 */
export function parse(t: typeof types, path: NodePath, options: ParseOptions = {}): common.NameofCallExpression | undefined
{
    if (!isNameof(path.node))
    {
        return undefined;
    }

    if (options.traverseChildren)
    {
        options.traverseChildren(); // tell the caller to go over the nodes in post order
    }

    const propertyName = parsePropertyName(path.node);

    // ignore nameof.interpolate function calls... they will be dealt with later
    if (isInterpolatePropertyName(propertyName))
    {
        handleNameofInterpolate(path.node);
        return undefined;
    }

    return parseNameof(path.node);

    /**
     * Parses the `nameof` call in the specified {@link callExpr `callExpr`}.
     *
     * @param callExpr
     * The expression to parse.
     *
     * @returns
     * The parsed `nameof` expression.
     */
    function parseNameof(callExpr: CallExpression): common.NameofCallExpression
    {
        return {
            property: propertyName,
            typeArguments: parseTypeArguments(callExpr),
            arguments: parseArguments(callExpr)
        };
    }

    /**
     * Gets the name of the `nameof` property which is being accessed inside the specified {@link callExpr `callExpr`}.
     *
     * @param callExpr
     * The expression to get the property name from.
     *
     * @returns
     * The name of the `nameof` property which is being accessed.
     */
    function parsePropertyName(callExpr: CallExpression): string | undefined
    {
        const { callee } = callExpr;

        if (!t.isMemberExpression(callee) || !t.isIdentifier(callee.property))
        {
            return undefined;
        }

        return callee.property.name;
    }

    /**
     * Gets the type arguments of the specified {@link callExpr `callExpr`}.
     *
     * @param callExpr
     * The expression to get the type arguments from.
     *
     * @returns
     * The type arguments of the specified {@link callExpr `callExpr`}.
     */
    function parseTypeArguments(callExpr: CallExpression): common.Node[]
    {
        // babel uses incorrect naming. these are type arguments
        const typeArguments = (callExpr as any).typeParameters as TSTypeParameterInstantiation | undefined;

        if (typeArguments === undefined)
        {
            return [];
        }

        return typeArguments.params.map(arg => parseCommonNode(arg));
    }

    /**
     * Gets the arguments of the specified {@link callExpr `callExpr`}.
     *
     * @param callExpr
     * The expression to get the arguments from.
     *
     * @returns
     * The arguments of the specified {@link callExpr `callExpr`}.
     */
    function parseArguments(callExpr: CallExpression): common.Node[]
    {
        return callExpr.arguments.map(arg => parseCommonNode(arg));
    }

    /**
     * Parses the specified {@link node `node`}.
     *
     * @param node
     * The node to parse.
     *
     * @returns
     * The parsed node.
     */
    function parseCommonNode(node: Node): common.Node
    {
        if (t.isMemberExpression(node))
        {
            return parseMemberExpression(node);
        }

        if (t.isArrowFunctionExpression(node))
        {
            return parseFunctionReturnExpression(node, getArrowFunctionReturnExpression(node));
        }

        if (t.isFunctionExpression(node))
        {
            return parseFunctionReturnExpression(node, getReturnStatementArgumentFromBlockOrThrow(node.body));
        }

        if (t.isTSNonNullExpression(node) || t.isParenthesizedExpression(node) || t.isTSAsExpression(node))
        {
            return parseCommonNode(node.expression);
        }

        if (t.isTSQualifiedName(node))
        {
            return parseQualifiedName(node);
        }

        if (t.isTSTypeReference(node))
        {
            return parseCommonNode(node.typeName);
        }

        if (t.isSpreadElement(node))
        {
            return parseCommonNode(node.argument);
        }

        if (t.isNumericLiteral(node) || isNegativeNumericLiteral(t, node))
        {
            return parseNumeric(node);
        }

        if (t.isStringLiteral(node))
        {
            return parseStringLiteral(node);
        }

        if (t.isIdentifier(node))
        {
            return parseIdentifier(node);
        }

        if (t.isArrayExpression(node))
        {
            return parseArrayExpression(node);
        }

        if (t.isThisExpression(node))
        {
            return common.createIdentifierNode("this");
        }

        if (t.isSuper(node))
        {
            return common.createIdentifierNode("super");
        }

        if (t.isTSImportType(node))
        {
            return parseImportType(node, false);
        }

        if (t.isTSTypeQuery(node) && t.isTSImportType(node.exprName))
        {
            return parseImportType(node.exprName, true);
        }

        if (t.isTSLiteralType(node))
        {
            return parseCommonNode(node.literal); // skip over and go straight to the literal
        }

        if (t.isTemplateLiteral(node))
        {
            return parseTemplateExpression(node);
        }

        if (isNameof(node) && isInterpolatePropertyName(parsePropertyName(node)))
        {
            return parseInterpolateNode(node);
        }

        return common.throwError(`Unhandled node type (${node.type}) in text: ${getNodeText(node)} (Please open an issue if you believe this should be supported.)`);
    }

    /**
     * Parses the specified {@link node `node`}.
     *
     * @param node
     * The node to parse.
     *
     * @returns
     * The parsed node.
     */
    function parseArrayExpression(node: ArrayExpression): common.ArrayLiteralNode
    {
        const result: common.Node[] = [];

        node.elements.forEach(
            element =>
            {
                if (element === null)
                {
                    return common.throwError(`Unsupported scenario with empty element encountered in array: ${getNodeText(node)}`);
                }

                result.push(parseCommonNode(element));
            });

        return common.createArrayLiteralNode(result);
    }

    /**
     * Parses the specified {@link node `node`}.
     *
     * @param node
     * The node to parse.
     *
     * @returns
     * The parsed node.
     */
    function parseMemberExpression(node: MemberExpression): common.Node
    {
        const expressionCommonNode = parseCommonNode(node.object);
        const nameCommonNode = parseCommonNode(node.property);
        const computedCommonNode = node.computed ? common.createComputedNode(nameCommonNode) : undefined;
        getEndCommonNode(expressionCommonNode).next = computedCommonNode ?? nameCommonNode;
        return expressionCommonNode;
    }

    /**
     * Parses the specified {@link node `node`}.
     *
     * @param node
     * The node to parse.
     *
     * @returns
     * The parsed node.
     */
    function parseQualifiedName(node: TSQualifiedName): common.Node
    {
        const leftCommonNode = parseCommonNode(node.left);
        const rightCommonNode = parseCommonNode(node.right);
        getEndCommonNode(leftCommonNode).next = rightCommonNode;
        return leftCommonNode;
    }

    /**
     * Parses the specified {@link node `node`}.
     *
     * @param node
     * The node to parse.
     *
     * @returns
     * The parsed node.
     */
    function parseNumeric(node: NumericLiteral | UnaryExpression): common.NumericLiteralNode
    {
        return common.createNumericLiteralNode(getNodeValue());

        /**
         * Gets the value of the {@link node `node`}.
         *
         * @returns
         * The value of the {@link node `node`}.
         */
        function getNodeValue(): number
        {
            if (t.isNumericLiteral(node))
            {
                return node.value;
            }

            return getNegativeNumericLiteralValue(t, node);
        }
    }

    /**
     * Parses the specified {@link node `node`}.
     *
     * @param node
     * The node to parse.
     *
     * @returns
     * The parsed node.
     */
    function parseStringLiteral(node: StringLiteral): common.StringLiteralNode
    {
        return common.createStringLiteralNode(node.value);
    }

    /**
     * Parses the specified {@link node `node`}.
     *
     * @param node
     * The node to parse.
     *
     * @returns
     * The parsed node.
     */
    function parseIdentifier(node: Node): common.IdentifierNode
    {
        const text = getIdentifierTextOrThrow(node);
        return common.createIdentifierNode(text);
    }

    /**
     * Parses the specified {@link functionNode `functionNode`}.
     *
     * @param functionNode
     * The function node to parse.
     *
     * @param node
     * The body of the specified function.
     *
     * @returns
     * The parsed node.
     */
    function parseFunctionReturnExpression(functionNode: FunctionExpression | ArrowFunctionExpression, node: Expression): common.FunctionNode
    {
        const parameterNames = functionNode.params.map(
            p =>
            {
                if (t.isIdentifier(p))
                {
                    return p.name;
                }
                return getNodeText(p);
            });

        return common.createFunctionNode(parseCommonNode(node), parameterNames);
    }

    /**
     * Parses the specified {@link node `node`}.
     *
     * @param node
     * The node to parse.
     *
     * @param isTypeOf
     * A value indicating whether the import type is lead by a `typeof` keyword.
     *
     * @returns
     * The parsed node.
     */
    function parseImportType(node: TSImportType, isTypeOf: boolean): common.ImportTypeNode
    {
        const importTypeNode = common.createImportTypeNode(isTypeOf, parseCommonNode(node.argument));
        const qualifier = node.qualifier ? parseCommonNode(node.qualifier) : undefined;
        getEndCommonNode(importTypeNode).next = qualifier;
        return importTypeNode;
    }

    /**
     * Parses the specified {@link node `node`}.
     *
     * @param node
     * The node to parse.
     *
     * @returns
     * The parsed node.
     */
    function parseTemplateExpression(node: TemplateLiteral): common.TemplateExpressionNode
    {
        return common.createTemplateExpressionNode(getParts());

        /**
         * Gets the template parts of the {@link node `node`}.
         *
         * @returns
         * The template parts of the {@link node `node`}.
         */
        function getParts(): Array<string | common.InterpolateNode>
        {
            const parts: Array<string | common.InterpolateNode> = [];

            // the number of quasis will always be greater than the number of expressions
            for (let i = 0; i < node.quasis.length; i++)
            {
                parts.push(node.quasis[i].value.raw);
                const expression = node.expressions[i];

                if (expression !== undefined)
                {
                    parts.push(common.createInterpolateNode(expression, getNodeText(expression)));
                }
            }

            return parts;
        }
    }

    /**
     * Parses the specified {@link node `node`}.
     *
     * @param node
     * The node to parse.
     *
     * @returns
     * The parsed node.
     */
    function parseInterpolateNode(node: CallExpression): common.InterpolateNode
    {
        if (node.arguments.length !== 1)
        {
            return common.throwError(`Expected a single argument for the nameof.interpolate function call ${getNodeText(node.arguments[0])}.`);
        }

        return common.createInterpolateNode(node.arguments[0], getNodeText(node.arguments[0]));
    }

    /**
     * Gets the last node in the chain of the specified {@link commonNode `commonNode`}.
     *
     * @param commonNode
     * The node to get the last item in the chain from.
     *
     * @returns
     * The last node in the chain of the specified {@link commonNode `commonNode`}.
     */
    function getEndCommonNode(commonNode: common.Node): common.Node
    {
        while (commonNode.next !== undefined)
        {
            commonNode = commonNode.next;
        }
        return commonNode;
    }

    /**
     * Gets the return expression of the specified {@link func `func`}.
     *
     * @param func
     * The function to get the return expression from.
     *
     * @returns
     * The return expression of the specified {@link func `func`}.
     */
    function getArrowFunctionReturnExpression(func: ArrowFunctionExpression): Expression
    {
        if (t.isBlock(func.body))
        {
            return getReturnStatementArgumentFromBlockOrThrow(func.body);
        }

        return func.body;
    }

    /**
     * Gets the text of the specified {@link node `node`}.
     *
     * @param node
     * The identifier to get the text from.
     *
     * @returns
     * The text of the specified {@link node `node`}.
     */
    function getIdentifierTextOrThrow(node: Node): string
    {
        if (!t.isIdentifier(node))
        {
            return common.throwError(`Expected node to be an identifier: ${getNodeText(node)}`);
        }

        return node.name;
    }

    /**
     * Gets the return statement of the specified {@link block `block`} or throws an error if no return statement was found.
     *
     * @param block
     * The block to get the return statement from.
     *
     * @returns
     * The return statement of the specified {@link block `block`}.
     */
    function getReturnStatementArgumentFromBlockOrThrow(block: BlockStatement): Expression
    {
        return getReturnStatementArgumentFromBlock(t, block) ??
        common.throwError(`Cound not find return statement with an expression in function expression: ${getNodeText(block)}`);
    }

    /**
     * Gets the text of the specified {@link node `node`}.
     *
     * @param node
     * The node to get the text from.
     *
     * @returns
     * The text of the specified {@link node `node`}.
     */
    function getNodeText(node: Node): string
    {
        const outerNodeStart = path.node.start ?? 0;
        const startOffset = (node.start ?? 0) - outerNodeStart;
        const endOffset = (node.end ?? 0) - outerNodeStart;

        return path.getSource().substring(startOffset, endOffset);
    }

    /**
     * Checks whether the specified {@link node `node`} is a `nameof` call.
     *
     * @param node
     * The node to check.
     *
     * @returns
     * A value indicating whether the specified {@link node `node`} is a `nameof` call.
     */
    function isNameof(node: Node): node is CallExpression
    {
        if (!t.isCallExpression(node))
        {
            return false;
        }

        const identifier = getIdentifierToInspect(node.callee);
        return identifier !== undefined && identifier.name === (options.nameofIdentifierName ?? "nameof");

        /**
         * Gets the identifier which is expected to be the `nameof` reference.
         *
         * @param expression
         * The expression to get the `nameof` portion from.
         *
         * @returns
         * The expected `nameof` identifier.
         */
        function getIdentifierToInspect(expression: Expression | V8IntrinsicIdentifier): Identifier | undefined
        {
            if (t.isIdentifier(expression))
            {
                return expression;
            }

            if (t.isMemberExpression(expression) && t.isIdentifier(expression.object))
            {
                return expression.object;
            }

            return undefined;
        }
    }

    /**
     * Processes the `interpolate` call in the specified {@link callExpr `callExpr`}.
     *
     * @param callExpr
     * The expression which contains the `interpolate` call.
     */
    function handleNameofInterpolate(callExpr: CallExpression): void
    {
        if (!hasAncestorNameofFull())
        {
            return common.throwError(
                "Found a nameof.interpolate that did not exist within a " +
                `nameof.full call expression: ${getNodeText(callExpr)}`);
        }

        if (callExpr.arguments.length !== 1)
        {
            return common.throwError("Unexpected scenario where a nameof.interpolate function did not have a single argument.");
        }

        /**
         * Checks whether the {@link callExpr `callExpr`} has a parent `nameof.full` call.
         *
         * @returns
         * A value indicating whether the {@link callExpr `callExpr`}
         */
        function hasAncestorNameofFull(): boolean
        {
            let parentPath: NodePath | null | undefined = path.parentPath;

            while (parentPath)
            {
                if (isNameof(parentPath.node) && parsePropertyName(parentPath.node) === "full")
                {
                    return true;
                }

                parentPath = parentPath.parentPath;
            }

            return false;
        }
    }

    /**
     * Checks whether the specified {@link propertyName `propertyName`} indicates an `interpolate` call.
     *
     * @param propertyName
     * The property name to check.
     *
     * @returns
     * A value indicating whether the specified {@link propertyName `propertyName`} indicates an `interpolate` call.
     */
    function isInterpolatePropertyName(propertyName: string | undefined): boolean
    {
        return propertyName === "interpolate";
    }
}
