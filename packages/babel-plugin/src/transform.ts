import type * as babelTypes from "@babel/types";
import common = require("@typescript-nameof/common");

/**
 * Converts the specified {@link node `node`} to a babel node.
 *
 * @param t
 * A component for handling babel types.
 *
 * @param node
 * The node to convert.
 *
 * @returns
 * The converted node.
 */
export function transform(t: typeof babelTypes, node: common.Node): babelTypes.StringLiteral | babelTypes.ArrayExpression | babelTypes.TemplateLiteral
{
    switch (node.kind)
    {
        case "StringLiteral":
            return t.stringLiteral(node.value);
        case "ArrayLiteral":
            return t.arrayExpression(node.elements.map(element => transform(t, element)));
        case "TemplateExpression":
            return createTemplateLiteral(t, node);
        default:
            return common.throwError(`Unsupported node kind: ${node.kind}`);
    }
}

/**
 * Converts the specified {@link node `node`} to a babel node.
 *
 * @param t
 * A component for handling babel types.
 *
 * @param node
 * The node to convert.
 *
 * @returns
 * The converted node.
 */
function createTemplateLiteral(t: typeof babelTypes, node: common.TemplateExpressionNode): babelTypes.TemplateLiteral
{
    const parts: babelTypes.TemplateElement[] = [];
    const expressions: babelTypes.Expression[] = [];

    for (const part of node.parts)
    {
        if (typeof part === "string")
        {
            parts.push(
                t.templateElement(
                    {
                        // I believe for the use case of this library, both the raw and cooked can be the same, but adding this
                        // just in case for the future...
                        raw: getRawValue(part),
                        // Need to add this for @babel/preset-env.
                        cooked: part
                    }));
        }
        else
        {
            const expr = part.expression as babelTypes.Expression;
            expressions.push(expr);
        }
    }

    // set the last quasi as the tail
    parts[parts.length - 1].tail = true;

    return t.templateLiteral(parts, expressions);

    /**
     * Gets the source code representing the specified {@link text `text`}.
     *
     * @param text
     * The text to get the source code from.
     *
     * @returns
     * The source code representing the specified {@link text `text`}.
     */
    function getRawValue(text: string): string
    {
        // From
        // Adds a backslash before every `, \ and ${
        return text.replace(/\\|`|\${/g, "\\$&");
    }
}
