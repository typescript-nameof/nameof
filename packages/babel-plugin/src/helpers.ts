// eslint-disable-next-line node/no-unpublished-import
import type { types } from "@babel/core";
import type { BlockStatement, Expression, Node, UnaryExpression } from "@babel/types";
import { throwError } from "@typescript-nameof/common";

/**
 * Checks whether the specified {@link node `node`} is a negative numeric literal.
 *
 * @param t
 * A component for handling babel types.
 *
 * @param node
 * The node to check
 *
 * @returns
 * A value indicating whether the specified {@link node `node`} is a negative numeric literal.
 */
export function isNegativeNumericLiteral(t: typeof types, node: Node): node is UnaryExpression
{
    if (!t.isUnaryExpression(node))
    {
        return false;
    }

    return node.operator === "-" && t.isNumericLiteral(node.argument);
}

/**
 * Either returns the value of the specified {@link node `node`} or throws an exception if the node is not a negative numeric literal.
 *
 * @param t
 * A component for handling babel types.
 *
 * @param node
 * The node to get the value from.
 *
 * @returns
 * The value of the specified {@link node `node`}.
 */
export function getNegativeNumericLiteralValue(t: typeof types, node: UnaryExpression): number
{
    if (node.operator !== "-" || !t.isNumericLiteral(node.argument))
    {
        return throwError("The passed in UnaryExpression must be for a negative numeric literal.");
    }

    return node.argument.value * -1;
}

/**
 * Gets the return value of the specified {@link block `block`}.
 *
 * @param t
 * A component for handling babel types.
 *
 * @param block
 * The block to get the return statement from.
 *
 * @returns
 * The return value of the specified {@link block `block`}.
 */
export function getReturnStatementArgumentFromBlock(t: typeof types, block: BlockStatement): Expression | undefined
{
    for (const statement of block.body)
    {
        if (t.isReturnStatement(statement) && statement.argument)
        {
            return statement.argument;
        }
    }

    return undefined;
}
