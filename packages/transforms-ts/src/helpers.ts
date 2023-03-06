import { throwError } from "@ts-nameof/common";
import * as ts from "typescript";

/**
 * Checks whether the specified {@link node `node`} is a negative numeric literal.
 *
 * @param node
 * The node to check.
 *
 * @returns
 * A value indicating whether the specified {@link node `node`} is a negative numeric literal.
 */
export function isNegativeNumericLiteral(node: ts.Node): node is ts.PrefixUnaryExpression
{
    if (!ts.isPrefixUnaryExpression(node))
    {
        return false;
    }

    return node.operator === ts.SyntaxKind.MinusToken &&
        ts.isNumericLiteral(node.operand);
}

/**
 * Gets the value of the specified {@link node `node`}.
 *
 * @param node
 * The node to get the value from.
 *
 * @returns
 * The value of the specified {@link node `node`}.
 */
export function getNegativeNumericLiteralValue(node: ts.PrefixUnaryExpression): number
{
    if (node.operator !== ts.SyntaxKind.MinusToken || !ts.isNumericLiteral(node.operand))
    {
        return throwError("The passed in PrefixUnaryExpression must be for a negative numeric literal.");
    }

    const result = parseFloat(node.operand.text);

    if (isNaN(result))
    {
        return throwError(`Unable to parse negative numeric literal: ${node.operand.text}`);
    }

    return result * -1;
}

/**
 * Gets the return statement of the specified {@link block `block`}.
 *
 * @param block
 * The block to get the return statement from.
 *
 * @returns
 * The return statement of the specified {@link block `block`}.
 */
export function getReturnStatementExpressionFromBlock(block: ts.Block): ts.Expression | undefined
{
    for (const statement of block.statements)
    {
        if (ts.isReturnStatement(statement) && statement.expression !== undefined)
        {
            return statement.expression;
        }
    }

    return undefined;
}

// todo: remove the use of the printer except for exceptions
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

/**
 * Gets the text of the specified {@link node `node`}.
 *
 * @param node
 * The node to get the text from.
 *
 * @param sourceFile
 * The source file which contains the specified {@link node `node`}.
 *
 * @returns
 * The text of the specified {@link node `node`}.
 */
export function getNodeText(node: ts.Node, sourceFile: ts.SourceFile): string
{
    return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
}
