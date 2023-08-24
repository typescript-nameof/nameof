import { Adapter, CallExpressionNode, FunctionNode, IdentifierNode, IndexAccessNode, INodeLocation, MissingImportTypeQualifierError, NameofResult, NodeKind, NoReturnExpressionError, NumericLiteralNode, ParsedNode, PropertyAccessNode, ResultType, StringLiteralNode, UnsupportedNode, UnsupportedNodeError } from "@typescript-nameof/common";
import ts = require("typescript");
import { ITypeScriptContext } from "./ITypeScriptContext.cjs";
import { TypeScriptFeatures } from "./TypeScriptFeatures.cjs";

/**
 * Provides the functionality to parse and dump `nameof` calls for typescript.
 */
export class TypeScriptAdapter extends Adapter<TypeScriptFeatures, ts.Node, ts.Node, ITypeScriptContext>
{
    /**
     * Initializes a new instance of the {@linkcode TypeScriptAdapter} class.
     *
     * @param features
     * The features of the platform integration.
     */
    public constructor(features: TypeScriptFeatures)
    {
        super(features);
    }

    /**
     * Gets the TypeScript compiler instance.
     */
    public get TypeScript(): typeof ts
    {
        return this.Features.TypeScript;
    }

    /**
     * @inheritdoc
     *
     * @param input
     * The input to extract the node from.
     *
     * @returns
     * The node that was extracted from the specified {@linkcode input}.
     */
    public Extract(input: ts.Node): ts.Node
    {
        return input;
    }

    /**
     * @inheritdoc
     *
     * @param item
     * The item whose location to get.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The location of the specified {@linkcode item}.
     */
    public GetLocation(item: ts.Node, context: ITypeScriptContext): INodeLocation
    {
        let location = context.file.getLineAndCharacterOfPosition(item.pos);

        return {
            filePath: context.file.fileName,
            line: location.line,
            column: location.character
        };
    }

    /**
     * @inheritdoc
     *
     * @param item
     * The item to get the source code from.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The code of the specified {@linkcode item}.
     */
    public GetSourceCode(item: ts.Node, context: ITypeScriptContext): string
    {
        return item.getText(context.file);
    }

    /**
     * Checks whether the specified {@linkcode item} is a function.
     *
     * @param item
     * The item to check.
     *
     * @returns
     * A value indicating whether the specified {@linkcode item} is a call expression.
     */
    protected IsCallExpression(item: ts.Node): item is ts.CallExpression
    {
        return this.TypeScript.isCallExpression(item);
    }

    /**
     * @inheritdoc
     *
     * @param item
     * The item to check.
     *
     * @returns
     * A value indicating whether the specified {@linkcode item} is a string literal.
     */
    protected IsStringLiteral(item: ts.Node): item is ts.StringLiteral
    {
        return this.TypeScript.isStringLiteral(item);
    }

    /**
     * @inheritdoc
     *
     * @param item
     * The item to check.
     *
     * @returns
     * A value indicating whether the specified {@linkcode item} is a template literal.
     */
    protected IsTemplateLiteral(item: ts.Node): boolean
    {
        return this.TypeScript.isTemplateLiteral(item);
    }

    /**
     * Gets the elements of the specified {@linkcode arrayLiteral}.
     *
     * @param arrayLiteral
     * The array literal to get the elements from.
     *
     * @returns
     * Either the elements of the {@linkcode arrayLiteral} or `undefined` if the specified {@linkcode arrayLiteral} is invalid.
     */
    protected GetArrayElements(arrayLiteral: ts.Node): ts.Node[] | undefined
    {
        if (this.TypeScript.isArrayLiteralExpression(arrayLiteral))
        {
            let result: ts.Node[] = [];

            for (let element of arrayLiteral.elements)
            {
                if (element)
                {
                    result.push(element);
                }
            }

            return result;
        }
        else
        {
            return undefined;
        }
    }

    /**
     * @inheritdoc
     *
     * @param elements
     * The elements of the array literal to create.
     *
     * @returns
     * The newly created array literal.
     */
    protected CreateArrayLiteral(elements: ts.Node[]): ts.Node
    {
        return this.TypeScript.factory.createArrayLiteralExpression(elements as ts.Expression[]);
    }

    /**
     * Parses the specified {@linkcode item}.
     *
     * @param item
     * The item to parse.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The parsed representation of the specified {@linkcode item}.
     */
    protected ParseInternal(item: ts.Node, context: ITypeScriptContext): ParsedNode<ts.Node>
    {
        if (this.IsCallExpression(item))
        {
            return new CallExpressionNode<ts.Node>(
                item,
                item.expression,
                item.typeArguments ?? [],
                item.arguments);
        }
        else if (
            [
                this.TypeScript.SyntaxKind.ThisKeyword,
                this.TypeScript.SyntaxKind.SuperKeyword,
                this.TypeScript.SyntaxKind.AnyKeyword,
                this.TypeScript.SyntaxKind.UnknownKeyword,
                this.TypeScript.SyntaxKind.VoidKeyword,
                this.TypeScript.SyntaxKind.NeverKeyword,
                this.TypeScript.SyntaxKind.ObjectKeyword,
                this.TypeScript.SyntaxKind.BooleanKeyword,
                this.TypeScript.SyntaxKind.NumberKeyword,
                this.TypeScript.SyntaxKind.BigIntKeyword,
                this.TypeScript.SyntaxKind.StringKeyword,
                this.TypeScript.SyntaxKind.SymbolKeyword
            ].includes(item.kind))
        {
            return new IdentifierNode(item, item.getText(context.file));
        }
        else if (this.TypeScript.isNumericLiteral(item))
        {
            return new NumericLiteralNode(item, parseFloat(item.text));
        }
        else if (this.IsStringLiteral(item))
        {
            return new StringLiteralNode(item, item.text);
        }
        else if (this.TypeScript.isIdentifier(item))
        {
            return new IdentifierNode(item, item.getText(context.file));
        }
        else if (this.TypeScript.isTypeReferenceNode(item))
        {
            return this.ParseNode(item.typeName, context);
        }
        else if (this.TypeScript.isImportTypeNode(item))
        {
            if (item.qualifier)
            {
                return this.ParseNode(item.qualifier, context);
            }
            else
            {
                throw new MissingImportTypeQualifierError(this, item, context);
            }
        }
        else if (
            this.TypeScript.isNonNullExpression(item) ||
            this.TypeScript.isParenthesizedExpression(item) ||
            this.TypeScript.isAsExpression(item))
        {
            return this.ParseNode(item.expression, context);
        }
        else if (this.TypeScript.isPrefixUnaryExpression(item))
        {
            if (
                [
                    this.TypeScript.SyntaxKind.PlusToken,
                    this.TypeScript.SyntaxKind.MinusToken
                ].includes(item.operator))
            {
                let node = this.ParseNode(item.operand, context);

                if (node.Type === NodeKind.NumericLiteralNode)
                {
                    return new NumericLiteralNode(
                        node.Source,
                        node.Value * (item.operator === this.TypeScript.SyntaxKind.MinusToken ? -1 : 1));
                }
            }
        }
        else if (this.TypeScript.isPropertyAccessExpression(item))
        {
            return this.ParsePropertyAccessExpression(item, item.expression, item.name, context);
        }
        // Dotted paths in type references
        else if (this.TypeScript.isQualifiedName(item))
        {
            return this.ParsePropertyAccessExpression(item, item.left, item.right, context);
        }
        else if (this.TypeScript.isElementAccessExpression(item))
        {
            return new IndexAccessNode(
                item,
                this.ParseNode(item.expression, context),
                this.ParseNode(item.argumentExpression, context));
        }
        else if (
            this.TypeScript.isArrowFunction(item) ||
            this.TypeScript.isFunctionExpression(item))
        {
            return this.ParseFunction(item, context);
        }

        return new UnsupportedNode(item);
    }

    /**
     * Parses a {@linkcode PropertyAccessNode} with the specified {@linkcode expression} and {@linkcode property}.
     *
     * @param source
     * The source of the node.
     *
     * @param expression
     * The expression of the property access expression.
     *
     * @param property
     * The property that is accessed in the expression.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The parsed representation of the specified {@linkcode source}.
     */
    protected ParsePropertyAccessExpression(source: ts.Node, expression: ts.Node, property: ts.MemberName, context: ITypeScriptContext): PropertyAccessNode<ts.Node>
    {
        return new PropertyAccessNode(
            source,
            this.ParseNode(expression, context),
            property.getText(context.file));
    }

    /**
     * Parses the specified {@linkcode item}.
     *
     * @param item
     * The item to parse.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The parsed representation of the specified {@linkcode item}.
     */
    protected ParseFunction(item: ts.ArrowFunction | ts.FunctionExpression, context: ITypeScriptContext): FunctionNode<ts.Node>
    {
        let expression = this.GetReturnExpression(item.body);

        if (expression)
        {
            return new FunctionNode(
                item,
                item.parameters.map(
                    (parameter) =>
                    {
                        if (this.TypeScript.isIdentifier(parameter.name))
                        {
                            return parameter.name.getText(context.file);
                        }
                        else
                        {
                            throw new UnsupportedNodeError(this, parameter, context);
                        }
                    }),
                expression);
        }
        else
        {
            throw new NoReturnExpressionError(this, item, context);
        }
    }

    /**
     * Gets the return expression from the specified {@linkcode body}.
     *
     * @param body
     * The function body to get the return statement from.
     *
     * @returns
     * The expression in the return statement of the specified {@linkcode body}.
     */
    protected GetReturnExpression(body: ts.ConciseBody): ts.Node | undefined
    {
        if (this.TypeScript.isBlock(body))
        {
            for (let statement of body.statements)
            {
                if (this.TypeScript.isReturnStatement(statement))
                {
                    if (statement.expression)
                    {
                        return statement.expression;
                    }
                }
                else
                {
                    // ToDo: Throw error regarding non-return statement
                }
            }

            return undefined;
        }
        else
        {
            return body;
        }
    }

    /**
     * Dumps the specified {@linkcode item}.
     *
     * @param item
     * The item to dump.
     *
     * @returns
     * The dumped node.
     */
    protected Dump(item: NameofResult<ts.Node>): ts.Node
    {
        switch (item.type)
        {
            case ResultType.Plain:
                return this.TypeScript.factory.createStringLiteral(item.text);
            case ResultType.Template:
                return this.TypeScript.factory.createTemplateExpression(
                    this.TypeScript.factory.createTemplateHead(item.templateParts[0]),
                    item.expressions.map(
                        (expression, index: number) =>
                        {
                            return this.TypeScript.factory.createTemplateSpan(
                                expression as ts.Expression,
                                this.TypeScript.factory.createTemplateMiddle(item.templateParts[index + 1]));
                        }));
            case ResultType.Node:
                return item.node;
        }
    }
}