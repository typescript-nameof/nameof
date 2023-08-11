import { ArrayLiteralNode, createArrayLiteralNode, createComputedNode, createFunctionNode, createIdentifierNode, createImportTypeNode, createInterpolateNode, createNumericLiteralNode, createStringLiteralNode, createTemplateExpressionNode, FunctionNode, IdentifierNode, ImportTypeNode, InterpolateNode, NameofCallExpression, Node, NumericLiteralNode, StringLiteralNode, TemplateExpressionNode, throwError } from "@typescript-nameof/common";
import * as ts from "typescript";
import { getNegativeNumericLiteralValue, getNodeText, getReturnStatementExpressionFromBlock, isNegativeNumericLiteral } from "./helpers";
import { VisitSourceFileContext } from "./VisitSourceFileContext";

/**
 * Parses the specified {@link parsingNode `parsingNode`}.
 *
 * @param parsingNode
 * The node to parse.
 *
 * @param sourceFile
 * The source file which contains the specified {@link parsingNode `parsingNode`}.
 *
 * @param context
 * The context of the transformation.
 *
 * @returns
 * The parsed node.
 */
export function parse(parsingNode: ts.Node, sourceFile: ts.SourceFile, context: VisitSourceFileContext | undefined): NameofCallExpression | undefined
{
    if (!isNameof(parsingNode))
    {
        return undefined;
    }

    const propertyName = parsePropertyName(parsingNode);

    // Ignore nameof.interpolate function calls... they will be dealt with later.
    if (isInterpolatePropertyName(propertyName))
    {
        handleNameofInterpolate(parsingNode);
        return undefined;
    }

    return parseNameof(parsingNode);

    /**
     * Parses the `nameof` call in the specified {@link callExpr `callExpr`}.
     *
     * @param callExpr
     * The expression to parse.
     *
     * @returns
     * The parsed node.
     */
    function parseNameof(callExpr: ts.CallExpression): NameofCallExpression
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
    function parsePropertyName(callExpr: ts.CallExpression): string | undefined
    {
        const { expression } = callExpr;

        if (!ts.isPropertyAccessExpression(expression) || !ts.isIdentifier(expression.name))
        {
            return undefined;
        }

        return expression.name.text;
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
    function parseTypeArguments(callExpr: ts.CallExpression): Node[]
    {
        if (callExpr.typeArguments === undefined)
        {
            return [];
        }

        return callExpr.typeArguments.map(arg => parseCommonNode(arg));
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
    function parseArguments(callExpr: ts.CallExpression): Node[]
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
    function parseCommonNode(node: ts.Expression | ts.TypeNode | ts.EntityName): Node
    {
        if (ts.isPropertyAccessExpression(node))
        {
            return parsePropertyAccessExpression(node);
        }

        if (ts.isElementAccessExpression(node))
        {
            return parseElementAccessExpression(node);
        }

        if (ts.isArrowFunction(node))
        {
            return parseFunctionReturnExpression(node, getArrowFunctionReturnExpression(node));
        }

        if (ts.isFunctionExpression(node))
        {
            return parseFunctionReturnExpression(node, getReturnStatementExpressionFromBlockOrThrow(node.body));
        }

        if (ts.isNonNullExpression(node) || ts.isParenthesizedExpression(node) || ts.isAsExpression(node))
        {
            return parseCommonNode(node.expression);
        }

        if (ts.isQualifiedName(node))
        {
            return parseQualifiedName(node);
        }

        if (ts.isTypeReferenceNode(node))
        {
            return parseCommonNode(node.typeName);
        }

        if (ts.isSpreadElement(node))
        {
            return parseCommonNode(node.expression);
        }

        if (ts.isNumericLiteral(node) || isNegativeNumericLiteral(node))
        {
            return parseNumeric(node);
        }

        if (ts.isStringLiteral(node))
        {
            return parseStringLiteral(node);
        }

        if (ts.isArrayLiteralExpression(node))
        {
            return parseArrayLiteralExpression(node);
        }

        if (ts.isIdentifier(node))
        {
            return parseIdentifier(node);
        }

        if (ts.isImportTypeNode(node))
        {
            return parseImportType(node);
        }

        if (ts.isLiteralTypeNode(node))
        {
            return parseCommonNode(node.literal); // skip over and go straight to the literal
        }

        if (node.kind === ts.SyntaxKind.ThisKeyword)
        {
            return createIdentifierNode("this");
        }

        if (node.kind === ts.SyntaxKind.SuperKeyword)
        {
            return createIdentifierNode("super");
        }

        if (ts.isNoSubstitutionTemplateLiteral(node))
        {
            return createTemplateExpressionNode([node.text]);
        }

        if (ts.isTemplateExpression(node))
        {
            return parseTemplateExpression(node);
        }

        if (isNameof(node) && isInterpolatePropertyName(parsePropertyName(node)))
        {
            return parseInterpolateNode(node);
        }

        return throwError(
            `Unhandled node kind (${node.kind}) in text: ${getNodeText(node, sourceFile)}` +
            " (Please open an issue if you believe this should be supported.)"
        );
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
    function parseArrayLiteralExpression(node: ts.ArrayLiteralExpression): ArrayLiteralNode
    {
        const elements = node.elements.map(element => parseCommonNode(element));
        return createArrayLiteralNode(elements);
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
    function parsePropertyAccessExpression(node: ts.PropertyAccessExpression): Node
    {
        const expressionCommonNode = parseCommonNode(node.expression);
        const nameCommonNode = parseIdentifier(node.name);
        getEndCommonNode(expressionCommonNode).next = nameCommonNode;
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
    function parseElementAccessExpression(node: ts.ElementAccessExpression): Node
    {
        const expressionCommonNode = parseCommonNode(node.expression);
        const argumentExpressionCommonNode = parseCommonNode(node.argumentExpression);
        const computedCommonNode = createComputedNode(argumentExpressionCommonNode);
        getEndCommonNode(expressionCommonNode).next = computedCommonNode;
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
    function parseQualifiedName(node: ts.QualifiedName): Node
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
    function parseNumeric(node: ts.NumericLiteral | ts.PrefixUnaryExpression): NumericLiteralNode
    {
        return createNumericLiteralNode(getNodeValue());

        /**
         * Gets the value of the {@link node `node`}.
         *
         * @returns
         * The value of the {@link node `node`}.
         */
        function getNodeValue(): number
        {
            if (ts.isNumericLiteral(node))
            {
                return parseFloat(node.text);
            }

            return getNegativeNumericLiteralValue(node);
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
    function parseStringLiteral(node: ts.StringLiteral): StringLiteralNode
    {
        return createStringLiteralNode(node.text);
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
    function parseIdentifier(node: ts.Node): IdentifierNode
    {
        const text = getIdentifierTextOrThrow(node);
        return createIdentifierNode(text);
    }

    /**
     * Parses the specified {@link functionLikeNode `functionLikeNode`}.
     *
     * @param functionLikeNode
     * The function node to parse.
     *
     * @param node
     * The body of the specified function.
     *
     * @returns
     * The parsed node.
     */
    function parseFunctionReturnExpression(functionLikeNode: ts.SignatureDeclaration, node: ts.Expression): FunctionNode
    {
        const parameterNames = functionLikeNode.parameters.map(p =>
        {
            const name = p.name;

            if (ts.isIdentifier(name))
            {
                return name.text;
            }

            return getNodeText(name, sourceFile);
        });

        return createFunctionNode(parseCommonNode(node), parameterNames);
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
    function parseImportType(node: ts.ImportTypeNode): ImportTypeNode
    {
        const importType = createImportTypeNode(node.isTypeOf || false, node.argument && parseCommonNode(node.argument));
        const qualifier = node.qualifier && parseCommonNode(node.qualifier);
        getEndCommonNode(importType).next = qualifier;
        return importType;
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
    function parseTemplateExpression(node: ts.TemplateExpression): TemplateExpressionNode
    {
        return createTemplateExpressionNode(getParts());

        /**
         * Gets the template parts of the {@link node `node`}.
         *
         * @returns
         * The template parts of the {@link node `node`}.
         */
        function getParts(): Array<InterpolateNode | string>
        {
            const parts: Array<InterpolateNode | string> = [];

            if (node.head.text.length > 0)
            {
                parts.push(node.head.text);
            }

            for (const templateSpan of node.templateSpans)
            {
                parts.push(createInterpolateNode(templateSpan.expression, getNodeText(templateSpan.expression, sourceFile)));
                parts.push(templateSpan.literal.text);
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
    function parseInterpolateNode(node: ts.CallExpression): InterpolateNode
    {
        if (node.arguments.length !== 1)
        {
            return throwError("Should never happen as this would have been tested for earlier.");
        }

        return createInterpolateNode(node.arguments[0], getNodeText(node.arguments[0], sourceFile));
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
    function getEndCommonNode(commonNode: Node): Node
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
    function getArrowFunctionReturnExpression(func: ts.ArrowFunction): ts.Expression
    {
        if (ts.isBlock(func.body))
        {
            return getReturnStatementExpressionFromBlockOrThrow(func.body);
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
    function getIdentifierTextOrThrow(node: ts.Node): string
    {
        if (!ts.isIdentifier(node))
        {
            return throwError(`Expected node to be an identifier: ${getNodeText(node, sourceFile)}`);
        }

        return node.text;
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
    function getReturnStatementExpressionFromBlockOrThrow(block: ts.Block): ts.Expression
    {
        return getReturnStatementExpressionFromBlock(block) ??
            throwError(`Cound not find return statement with an expression in function expression: ${getNodeText(block, sourceFile)}`);
    }

    /**
     * Processes the `interpolate` call in the specified {@link callExpr `callExpr`}.
     *
     * @param callExpr
     * The expression which contains the `interpolate` call.
     */
    function handleNameofInterpolate(callExpr: ts.CallExpression): void
    {
        if (callExpr.arguments.length !== 1)
        {
            return throwError("Unexpected scenario where a nameof.interpolate function did not have a single argument.");
        }

        // Add the interpolate expression to the context so that it can be checked later to find
        // nameof.interpolate calls that were never resolved.
        if (context !== undefined)
        {
            context.interpolateExpressions.add(callExpr.arguments[0]);
        }
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
    function isNameof(node: ts.Node): node is ts.CallExpression
    {
        if (!ts.isCallExpression(node))
        {
            return false;
        }

        const identifier = getIdentifierToInspect(node.expression);
        return identifier !== undefined && identifier.text === "nameof";

        /**
         * Gets the identifier which is expected to be the `nameof` reference.
         *
         * @param expression
         * The expression to get the `nameof` portion from.
         *
         * @returns
         * The expected `nameof` identifier.
         */
        function getIdentifierToInspect(expression: ts.LeftHandSideExpression): ts.Identifier | undefined
        {
            if (ts.isIdentifier(expression))
            {
                return expression;
            }

            if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.expression))
            {
                return expression.expression;
            }
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
