// eslint-disable-next-line node/no-unpublished-import
import { NodePath, types } from "@babel/core";
import { Adapter, CallExpressionNode, FunctionNode, IdentifierNode, IndexAccessNode, INodeLocation, MissingImportTypeQualifierError, NameofResult, NodeKind, NoReturnExpressionError, NumericLiteralNode, ParsedNode, PropertyAccessNode, ResultType, StringLiteralNode, UnsupportedNode, UnsupportedNodeError } from "@typescript-nameof/common";
import { BabelContext } from "./Transformation/BabelContext.cjs";
import { BabelFeatures } from "./Transformation/BabelFeatures.cjs";

/**
 * Provides the functionality to parse and dump `nameof` calls for babel.
 */
export class BabelAdapter extends Adapter<BabelFeatures, NodePath, types.Node, BabelContext>
{
    /**
     * Initializes a new instance of the {@linkcode BabelAdapter} class.
     *
     * @param features
     * The features of the babel transformer.
     */
    public constructor(features: BabelFeatures)
    {
        super(features);
    }

    /**
     * Gets a component for handling babel types.
     */
    protected get Types(): typeof types
    {
        return this.Features.Types;
    }

    /**
     * @inheritdoc
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The expected name of function calls.
     */
    public override GetNameofName(context: BabelContext): string
    {
        return context.nameofIdentifierName ?? super.GetNameofName(context);
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
    public Extract(input: NodePath): types.Node
    {
        return input.node;
    }

    /**
     * @inheritdoc
     *
     * @param item
     * The item to check.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * A value indicating whether the specified {@linkcode item} has been mutated in a previous `nameof` call.
     */
    public override IsMutated(item: types.Node, context: BabelContext): boolean
    {
        return (item.extra as any)?.[this.OriginalSymbol] ?? false;
    }

    /**
     * @inheritdoc
     *
     * @param input
     * The item to transform.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The transformed node.
     */
    public override Transform(input: NodePath, context: BabelContext): types.Node
    {
        context.traverseChildren?.();
        return super.Transform(input, context);
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
    public GetLocation(item: types.Node, context: BabelContext): INodeLocation
    {
        let result: INodeLocation = {
            filePath: context.state.filename,
            column: item.loc?.start.column
        };

        if (item.loc?.start.line)
        {
            result.line = item.loc.start.line - 1;
        }

        return result;
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
    public GetSourceCode(item: types.Node, context: BabelContext): string
    {
        return context.state.file.code.slice(item.start as number, item.end as number);
    }

    /**
     * Checks whether the specified {@linkcode item} is a call expression.
     *
     * @param item
     * The item to check.
     *
     * @returns
     * A value indicating whether the specified {@linkcode item} is a call expression.
     */
    protected IsCallExpression(item: types.Node): item is types.CallExpression
    {
        return this.Types.isCallExpression(item);
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
    protected IsStringLiteral(item: types.Node): item is types.StringLiteral
    {
        return this.Types.isStringLiteral(item);
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
    protected IsTemplateLiteral(item: types.Node): boolean
    {
        return this.Types.isTemplateLiteral(item);
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
    protected GetArrayElements(arrayLiteral: types.Node): types.Node[] | undefined
    {
        if (this.Types.isArrayExpression(arrayLiteral))
        {
            let result: types.Node[] = [];

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
    protected CreateArrayLiteral(elements: types.Node[]): types.Node
    {
        return this.Types.arrayExpression(elements as types.Expression[]);
    }

    /**
     * @inheritdoc
     *
     * @param original
     * The node to store.
     *
     * @param newNode
     * The newly created node.
     */
    protected override StoreOriginal(original: types.Node, newNode: types.Node): void
    {
        newNode.extra ??= {};
        (newNode.extra as any)[this.OriginalSymbol] = original;
    }

    /**
     * @inheritdoc
     *
     * @param node
     * The node to get the original from.
     *
     * @returns
     * The original node of the specified {@linkcode node}.
     */
    protected override GetOriginal(node: types.Node): types.Node | undefined
    {
        return (node.extra as any)?.[this.OriginalSymbol];
    }

    /**
     * @inheritdoc
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
    protected ParseInternal(item: types.Node, context: BabelContext): ParsedNode<types.Node>
    {
        if (this.IsCallExpression(item))
        {
            return new CallExpressionNode<types.Node>(
                item,
                item.callee,
                item.typeParameters?.params ?? [],
                item.arguments);
        }
        else if (
            this.Types.isThisExpression(item) ||
            this.Types.isSuper(item) ||
            this.Types.isTSAnyKeyword(item) ||
            this.Types.isTSUnknownKeyword(item) ||
            this.Types.isTSVoidKeyword(item) ||
            this.Types.isTSNeverKeyword(item) ||
            this.Types.isTSObjectKeyword(item) ||
            this.Types.isTSBooleanKeyword(item) ||
            this.Types.isTSNumberKeyword(item) ||
            this.Types.isTSBigIntKeyword(item) ||
            this.Types.isTSStringKeyword(item) ||
            this.Types.isTSSymbolKeyword(item))
        {
            return new IdentifierNode(item, this.GetSourceCode(item, context));
        }
        else if (this.Types.isNumericLiteral(item))
        {
            return new NumericLiteralNode(item, item.value);
        }
        else if (this.IsStringLiteral(item))
        {
            return new StringLiteralNode(item, item.value);
        }
        else if (this.Types.isIdentifier(item))
        {
            return new IdentifierNode(item, item.name);
        }
        else if (this.Types.isTSTypeReference(item))
        {
            return this.ParseNode(item.typeName, context);
        }
        else if (this.Types.isTSImportType(item))
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
            this.Types.isTSNonNullExpression(item) ||
            this.Types.isParenthesizedExpression(item) ||
            this.Types.isTSAsExpression(item))
        {
            return this.ParseNode(item.expression, context);
        }
        else if (this.Types.isUnaryExpression(item))
        {
            if (["-", "+"].includes(item.operator))
            {
                let node = this.ParseNode(item.argument, context);

                if (node.Type === NodeKind.NumericLiteralNode)
                {
                    return new NumericLiteralNode(
                        node.Source,
                        node.Value * (item.operator === "-" ? -1 : 1));
                }
            }
        }
        else if (this.Types.isMemberExpression(item))
        {
            if (item.computed)
            {
                return new IndexAccessNode(
                    item,
                    this.ParseNode(item.object, context),
                    this.ParseNode(item.property, context));
            }
            else if (this.Types.isIdentifier(item.property))
            {
                return this.ParsePropertyAccessExpression(item, item.object, item.property, context);
            }
        }
        // Dotted paths in type references
        else if (this.Types.isTSQualifiedName(item))
        {
            return this.ParsePropertyAccessExpression(item, item.left, item.right, context);
        }
        // Index access paths in type references
        else if (this.Types.isTSIndexedAccessType(item))
        {
            let indexer: types.Node;

            if (this.Types.isTSLiteralType(item.indexType))
            {
                indexer = item.indexType.literal;
            }
            else
            {
                indexer = item.indexType;
            }

            return new IndexAccessNode(
                item,
                this.ParseNode(item.objectType, context),
                this.ParseNode(indexer, context));
        }
        else if (
            this.Types.isFunctionExpression(item) ||
            this.Types.isArrowFunctionExpression(item))
        {
            let expression = this.Types.isBlock(item.body) ?
                this.GetReturnExpression(item.body, context) :
                item.body;

            if (expression)
            {
                return new FunctionNode<types.Node>(
                    item,
                    item.params.map(
                        (parameter) =>
                        {
                            if (this.Types.isIdentifier(parameter))
                            {
                                return parameter.name;
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
    protected ParsePropertyAccessExpression(source: types.Node, expression: types.Node, property: types.Identifier, context: BabelContext): PropertyAccessNode<types.Node>
    {
        return new PropertyAccessNode(
            source,
            this.ParseNode(expression, context),
            property.name);
    }

    /**
     * Gets the expression that is returned in the specified {@linkcode block}.
     *
     * @param block
     * The block to get the returned expression from.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The return expression of the specified {@linkcode block}.
     */
    protected GetReturnExpression(block: types.Block, context: BabelContext): types.Node | undefined
    {
        for (let statement of block.body)
        {
            if (this.Types.isReturnStatement(statement))
            {
                if (statement.argument)
                {
                    return statement.argument;
                }
            }
            else
            {
                // ToDo: Throw error for non-return statements.
            }
        }

        return undefined;
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
    protected Dump(item: NameofResult<types.Node>): types.Node
    {
        switch (item.type)
        {
            case ResultType.Plain:
                return this.Types.stringLiteral(item.text);
            case ResultType.Template:
                return this.Types.templateLiteral(
                    item.templateParts.map((part) => this.Types.templateElement({ raw: part })),
                    item.expressions as types.Expression[]);
            case ResultType.Node:
                return item.node;
        }
    }
}
