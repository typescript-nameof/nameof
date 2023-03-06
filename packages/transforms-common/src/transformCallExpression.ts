import { assertNever, throwError } from "@ts-nameof/common";
import { createArrayLiteralNode, createStringLiteralNode, createTemplateExpressionNode } from "./nodeFactories";
import { flattenNodeToArray, getLastNextNode } from "./nodeHelpers";
import { ArrayLiteralNode, FunctionNode, NameofCallExpression, Node, StringLiteralNode, TemplateExpressionNode } from "./nodes";
import { printCallExpression, printNode } from "./printers";
import { StringOrTemplateExpressionNodeBuilder } from "./StringOrTemplateExpressionBuilder";

/**
 * Represents the source to get a name from.
 */
interface INameSource
{
    /**
     * The expression to get the name from.
     */
    expression: Node;

    /**
     * The number of elements to include.
     */
    count: number;
}

/**
 * Transforms the specified {@link callExpr `callExpr`}.
 *
 * @param callExpr
 * The expression to transform.
 *
 * @returns
 * The transformed expression.
 */
export function transformCallExpression(callExpr: NameofCallExpression): Node
{
    if (callExpr.property === undefined)
    {
        return handleNameof(callExpr);
    }

    if (callExpr.property === "full")
    {
        return handleNameofFull(callExpr);
    }

    if (callExpr.property === "toArray")
    {
        return handleNameofToArray(callExpr);
    }

    if (callExpr.property === "split")
    {
        return handleNameofSplit(callExpr);
    }

    return throwError(`Unsupported nameof call expression with property '${callExpr.property}': ${printCallExpression(callExpr)}`);
}

/**
 * Transforms the specified `nameof()` call.
 *
 * @param callExpr
 * The expression to transform.
 *
 * @returns
 * The transformed expression.
 */
function handleNameof(callExpr: NameofCallExpression): Node
{
    return parseNameofExpression(getExpression());

    /**
     * Gets the target expression of the call.
     *
     * @returns
     * The target expression of the call.
     */
    function getExpression(): Node
    {
        if (callExpr.arguments.length === 1)
        {
            return callExpr.arguments[0];
        }
        else if (callExpr.typeArguments.length === 1)
        {
            return callExpr.typeArguments[0];
        }

        return throwError(`Call expression must have one argument or type argument: ${printCallExpression(callExpr)}`);
    }
}

/**
 * Transforms the specified `nameof.full()` call.
 *
 * @param callExpr
 * The expression to transform.
 *
 * @returns
 * The transformed expression.
 */
function handleNameofFull(callExpr: NameofCallExpression): Node
{
    return parseNameofFullExpression(getNodesFromCallExpression(callExpr));
}

/**
 * Transforms the specified `nameof.split()` call.
 *
 * @param callExpr
 * The expression to transform.
 *
 * @returns
 * The transformed expression.
 */
function handleNameofSplit(callExpr: NameofCallExpression): ArrayLiteralNode
{
    const literalNodes = getNodesFromCallExpression(callExpr).map(node => parseNode(node));
    return createArrayLiteralNode(literalNodes);
}

/**
 * Transforms the specified `nameof.toArray()` call.
 *
 * @param callExpr
 * The expression to transform.
 *
 * @returns
 * The transformed expression.
 */
function handleNameofToArray(callExpr: NameofCallExpression): ArrayLiteralNode
{
    const arrayArguments = getNodeArray();
    return createArrayLiteralNode(arrayArguments.map(element => parseNameofExpression(element)));

    /**
     * Gets the target nodes of the call.
     *
     * @returns
     * The target nodes of the call.
     */
    function getNodeArray(): Node[]
    {
        if (callExpr.arguments.length === 0)
        {
            return throwError(`Unable to parse call expression. No arguments provided: ${printCallExpression(callExpr)}`);
        }

        const firstArgument = callExpr.arguments[0];

        if (callExpr.arguments.length === 1 && firstArgument.kind === "Function")
        {
            return handleFunction(firstArgument);
        }
        else
        {
            return callExpr.arguments;
        }

        /**
         * Gets the target nodes from the specified {@link func `func`}.
         *
         * @param func
         * The function to get the nodes from.
         *
         * @returns
         * The nodes to determine the names of.
         */
        function handleFunction(func: FunctionNode): Node[]
        {
            const functionReturnValue = func.value;

            if (functionReturnValue === undefined || functionReturnValue.kind !== "ArrayLiteral")
            {
                return throwError(`Unsupported toArray call expression. An array must be returned by the provided function: ${printCallExpression(callExpr)}`);
            }

            return functionReturnValue.elements;
        }
    }
}

/**
 * Gets the target nodes from the specified {@link callExpr `callExpr`}.
 *
 * @param callExpr
 * The expression to get the target nodes from.
 *
 * @returns
 * The target nodes in the specified {@link callExpr `callExpr`}.
 */
function getNodesFromCallExpression(callExpr: NameofCallExpression): Node[]
{
    const { expression, count } = getExpressionAndCount();
    return getNodesFromCount(flattenNodeToArray(expression), count);

    /**
     * Gets the source to get the name from.
     *
     * @returns
     * The source to get the name from.
     */
    function getExpressionAndCount(): INameSource
    {
        if (shouldUseArguments())
        {
            return {
                expression: getArgumentExpression(),
                count: getCountFromNode(callExpr.arguments.length > 1 ? callExpr.arguments[1] : undefined)
            };
        }

        if (callExpr.typeArguments.length > 0)
        {
            return {
                expression: callExpr.typeArguments[0],
                count: getCountFromNode(callExpr.arguments.length > 0 ? callExpr.arguments[0] : undefined)
            };
        }

        return throwError(`Unsupported use of nameof.full: ${printCallExpression(callExpr)}`);

        /**
         * Checks whether names should be determined based on function arguments.
         *
         * @returns
         * A value indicating whether names should be determined based on function arguments.
         */
        function shouldUseArguments(): boolean
        {
            if (callExpr.arguments.length === 0)
            {
                return false;
            }

            if (callExpr.typeArguments.length === 0)
            {
                return true;
            }

            return callExpr.arguments[0].kind === "Function";
        }

        /**
         * Gets the target expression to determine the name of.
         *
         * @returns
         * The target expression.
         */
        function getArgumentExpression(): Node
        {
            let expression = callExpr.arguments[0];

            if (expression.kind === "Function")
            {
                expression = expression.value;

                // skip over the first identifier (ex. skip over `obj` in `obj => obj.test`)
                if (expression.next === undefined)
                {
                    return throwError(`A property must be accessed on the object: ${printNode(callExpr.arguments[0])}`);
                }

                expression = expression.next;
            }
            return expression;
        }

        /**
         * Gets the desired number of name parts to include as specified in the {@link countExpr `countExpr`}.
         *
         * @param countExpr
         * The expression which is expected to hold the desired number of name parts to include.
         *
         * @returns
         * The desired number of name parts to include.
         */
        function getCountFromNode(countExpr: Node | undefined): number
        {
            if (countExpr === undefined)
            {
                return 0;
            }

            if (countExpr.kind !== "NumericLiteral")
            {
                return throwError(`Expected count to be a number, but was: ${printNode(countExpr)}`);
            }

            return countExpr.value;
        }
    }

    /**
     * Gets the specified amount of nodes.
     *
     * @param nodes
     * The nodes to choose the targets from.
     *
     * @param count
     * The number of targets to get. I the value is negative, elements will be taken from the end of the {@link nodes `nodes`} array.
     *
     * @returns
     * The target nodes.
     */
    function getNodesFromCount(nodes: Node[], count: number): Node[]
    {
        if (count > 0)
        {
            if (count > nodes.length - 1)
            {
                return throwError(`Count of ${count} was larger than max count of ${nodes.length - 1}: ${printCallExpression(callExpr)}`);
            }

            return nodes.slice(count);
        }

        if (count < 0)
        {
            if (Math.abs(count) > nodes.length)
            {
                return throwError(`Count of ${count} was larger than max count of ${nodes.length * -1}: ${printCallExpression(callExpr)}`);
            }

            return nodes.slice(nodes.length + count);
        }
        return nodes;
    }
}

/**
 * Transforms the specified {@link expression `expression`}.
 *
 * @param expression
 * The expression to transform.
 *
 * @returns
 * The transformed expression.
 */
function parseNameofExpression(expression: Node): Node
{
    return parseNode(getNodeForNameOf(), expression);

    /**
     * Gets the target node.
     *
     * @returns
     * The target node.
     */
    function getNodeForNameOf(): Node
    {
        const node = getLastNextNode(expression);

        if (node.kind === "Function")
        {
            const argument = node.value;

            if (argument.next === undefined)
            {
                return throwError(`A property must be accessed on the object: ${printNode(expression)}`);
            }

            return getLastNextNode(argument.next);
        }
        return node;
    }
}

/**
 * Transforms the specified {@link node `node`}.
 *
 * @param node
 * The node to transform.
 *
 * @param parent
 * The parent of the specified {@link node `node`}.
 *
 * @returns
 * The transformed node.
 */
function parseNode(node: Node, parent?: Node): Node
{
    switch (node.kind)
    {
        case "Identifier":
            return createStringLiteralNode(node.value);
        case "StringLiteral":
            // make a copy
            return createStringLiteralNode(node.value);
        case "TemplateExpression":
            // todo: test this
            return createTemplateExpressionNode(node.parts);
        case "NumericLiteral":
            // make a copy
            return createStringLiteralNode(node.value.toString());
        case "Function":
            return throwError(`Nesting functions is not supported: ${printNode(parent ?? node)}`);
        case "Computed":
            if (node.value.kind === "StringLiteral" && node.value.next === undefined)
            {
                return createStringLiteralNode(node.value.value);
            }

            return throwError(`First accessed property must not be computed except if providing a string: ${printNode(parent ?? node)}`);
        case "Interpolate":
        case "ArrayLiteral":
        case "ImportType":
            throwNotSupportedErrorForNode(node);
            break;
        default:
            return assertNever(node, `Not implemented node: ${JSON.stringify(node)}`);
    }
}

/**
 * Transforms the specified {@link expressionNodes `expressionNodes`}.
 *
 * @param expressionNodes
 * The nodes to transform.
 *
 * @returns
 * The transformed nodes.
 */
function parseNameofFullExpression(expressionNodes: Node[]): StringLiteralNode | TemplateExpressionNode
{
    const nodeBuilder = new StringOrTemplateExpressionNodeBuilder();

    for (let i = 0; i < expressionNodes.length; i++)
    {
        const node = expressionNodes[i];

        if (i > 0 && node.kind === "Identifier")
        {
            nodeBuilder.addText(".");
        }

        addNodeToBuilder(node);
    }

    return nodeBuilder.buildNode();

    /**
     * Adds the specified {@link node `node`} to the result.
     *
     * @param node
     * The node to add.
     */
    function addNodeToBuilder(node: Node): void
    {
        switch (node.kind)
        {
            case "Identifier":
                nodeBuilder.addText(node.value);
                break;
            case "Computed":
                nodeBuilder.addText("[");
                const computedNodes = flattenNodeToArray(node.value);

                for (let i = 0; i < computedNodes.length; i++)
                {
                    const computedNode = computedNodes[i];

                    if (computedNode.kind === "StringLiteral")
                    {
                        nodeBuilder.addText(`"${computedNode.value}"`);
                    }
                    else
                    {
                        if (i > 0 && computedNode.kind === "Identifier")
                        {
                            nodeBuilder.addText(".");
                        }

                        addNodeToBuilder(computedNode);
                    }
                }

                nodeBuilder.addText("]");
                break;
            case "TemplateExpression":
            case "StringLiteral":
                nodeBuilder.addItem(node);
                break;
            case "NumericLiteral":
                nodeBuilder.addText(node.value.toString());
                break;
            case "Interpolate":
                nodeBuilder.addItem(node);
                break;
            case "ArrayLiteral":
            case "ImportType":
            case "Function":
                throwNotSupportedErrorForNode(node);
                break;
            default:
                return assertNever(node, `Not implemented node: ${JSON.stringify(node)}`);
        }
    }
}

/**
 * Throws an exception stating that the specified {@link node `node`} is unsupported.
 *
 * @param node
 * The unsupported node.
 */
function throwNotSupportedErrorForNode(node: Node): never
{
    throwError(`The node \`${printNode(node)}\` is not supported in this scenario.`);
}
