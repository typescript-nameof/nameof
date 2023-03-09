import { assertNever } from "@typescript-nameof/core";
import { NameofCallExpression, Node, TemplateExpressionNode } from "./nodes";

/**
 * Prints the specified {@link callExpr `callExpr`}.
 *
 * @param callExpr
 * The expression to print.
 *
 * @returns
 * The source code representing the specified {@link callExpr `callExpr`}.
 */
export function printCallExpression(callExpr: NameofCallExpression): string
{
    let result = "nameof";

    writePropertyName();

    if (callExpr.typeArguments.length > 0)
    {
        writeTypeArguments();
    }

    writeArguments();

    return result;

    /**
     * Adds a property access expression to the result.
     */
    function writePropertyName(): void
    {
        if (callExpr.property !== undefined)
        {
            result += `.${callExpr.property}`;
        }
    }

    /**
     * Adds the type arguments to the result.
     */
    function writeTypeArguments(): void
    {
        result += "<";

        for (let i = 0; i < callExpr.typeArguments.length; i++)
        {
            if (i > 0)
            {
                result += ", ";
            }

            result += printNode(callExpr.typeArguments[i]);
        }

        result += ">";
    }

    /**
     * Adds the function arguments to the result.
     */
    function writeArguments(): void
    {
        result += "(";

        for (let i = 0; i < callExpr.arguments.length; i++)
        {
            if (i > 0)
            {
                result += ", ";
            }

            result += printNode(callExpr.arguments[i]);
        }

        result += ")";
    }
}

/**
 * Prints the specified {@link node `node`}.
 *
 * @param node
 * The node to print.
 *
 * @returns
 * The source code representing the specified {@link node `node`}.
 */
export function printNode(node: Node): string
{
    // todo: this should throw in more scenarios (ex. string literal after an identifier)
    let result = getCurrentText();

    if (node.next !== undefined)
    {
        if (node.next.kind === "Identifier")
        {
            result += "." + printNode(node.next);
        }
        else
        {
            result += printNode(node.next);
        }
    }

    return result;

    /**
     * Gets the source code of the {@link node `node`}.
     *
     * @returns
     * The source code of the {@link node `node`}.
     */
    function getCurrentText(): string
    {
        switch (node.kind)
        {
            case "StringLiteral":
                return `"${node.value}"`;
            case "NumericLiteral":
                return node.value.toString();
            case "Identifier":
                return node.value;
            case "Computed":
                return `[${printNode(node.value)}]`;
            case "Function":
                let functionResult = `(${node.parameterNames.join(", ")}) => ${printNode(node.value)}`;

                if (node.next !== undefined)
                {
                    functionResult = `(${functionResult})`;
                }

                return functionResult;
            case "ArrayLiteral":
                return `[${node.elements.map(e => printNode(e)).join(", ")}]`;
            case "ImportType":
                return (node.isTypeOf ? "typeof " : "") + `import(${node.argument === undefined ? "" : printNode(node.argument)})`;
            case "Interpolate":
                return `nameof.interpolate(${node.expressionText})`;
            case "TemplateExpression":
                return printTemplateExpression(node);
            default:
                return assertNever(node, `Unhandled kind: ${(node as Node).kind}`);
        }
    }

    /**
     * Prints the specified expression.
     *
     * @param TemplateExpression
     * The expression to print.
     *
     * @returns
     * The source code representing the specified {@link TemplateExpression `TemplateExpression`}.
     */
    function printTemplateExpression(TemplateExpression: TemplateExpressionNode): string
    {
        let text = "`";

        for (const part of TemplateExpression.parts)
        {
            if (typeof part === "string")
            {
                text += part;
            }
            else
            {
                text += "${" + printNode(part) + "}";
            }
        }

        text += "`";
        return text;
    }
}
