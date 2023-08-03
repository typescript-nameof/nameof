import * as common from "@typescript-nameof/common";
import * as ts from "typescript";
import { VisitSourceFileContext } from "./VisitSourceFileContext";

/**
 * Resulting node type of a nameof transform.
 */
export type TransformResult = ts.StringLiteral | ts.ArrayLiteralExpression | ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression;

/**
 * Converts the specified {@link node `node`} to a TypeScript AST node.
 *
 * @param node
 * The node to convert.
 *
 * @param context
 * The context of the transformation.
 *
 * @returns
 * The converted node.
 */
export function transform(node: common.Node, context: VisitSourceFileContext | undefined): TransformResult
{
    switch (node.kind)
    {
        case "StringLiteral":
            return ts.factory.createStringLiteral(node.value);
        case "ArrayLiteral":
            return ts.factory.createArrayLiteralExpression(node.elements.map(element => transform(element, context)));
        case "TemplateExpression":
            if (node.parts.length === 1 && typeof node.parts[0] === "string")
            {
                return ts.factory.createNoSubstitutionTemplateLiteral(node.parts[0]);
            }

            return createTemplateExpression(node, context);
        default:
            return common.throwError(`Unsupported node kind: ${node.kind}`);
    }
}

/**
 * Converts the specified {@link node `node`} to a template expression.
 *
 * @param node
 * The node to convert.
 *
 * @param context
 * The context of the transformation.
 *
 * @returns
 * The converted node.
 */
function createTemplateExpression(node: common.TemplateExpressionNode, context: VisitSourceFileContext | undefined): ts.TemplateExpression
{
    const firstPart = typeof node.parts[0] === "string" ? node.parts[0] : undefined;
    const parts = firstPart !== undefined ? node.parts.slice(1) : [...node.parts];

    return ts.factory.createTemplateExpression(ts.factory.createTemplateHead(firstPart ?? ""), getParts());

    /**
     * Gets the parts of the template expression.
     *
     * @returns
     * The parts of the template expression.
     */
    function getParts(): ts.TemplateSpan[]
    {
        const templateSpans: ts.TemplateSpan[] = [];

        for (let i = 0; i < parts.length; i += 2)
        {
            const isLast = i + 2 === parts.length;
            const interpolatedNode = parts[i];

            if (typeof interpolatedNode === "string")
            {
                return common.throwError("Unexpected scenario where an interpolated node was expected, but a string was found.");
            }

            const text = parts[i + 1];

            if (typeof text !== "string")
            {
                return common.throwError("Unexpected scenario where a string was expected, but an interpolated node was found.");
            }

            const tsExpression = interpolatedNode.expression as ts.Expression;
            const tsText = !isLast ? ts.factory.createTemplateMiddle(text) : ts.factory.createTemplateTail(text);

            // mark this nameof.interpolate expression as being handled
            if (context !== undefined)
            {
                context.interpolateExpressions.delete(tsExpression);
            }

            templateSpans.push(ts.factory.createTemplateSpan(tsExpression, tsText));
        }
        return templateSpans;
    }
}
