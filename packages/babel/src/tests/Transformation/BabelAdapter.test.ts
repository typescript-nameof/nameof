import { deepStrictEqual, ok, strictEqual, throws } from "node:assert";
import babel, { Node, NodePath, PluginPass } from "@babel/core";
import parser from "@babel/parser";
import { TempFile } from "@manuth/temp-files";
import { INodeLocation, MissingImportTypeQualifierError, NameofResult, NodeKind, NoReturnExpressionError, ParsedNode, ResultType, UnsupportedNodeError } from "@typescript-nameof/common";
import fs from "fs-extra";
import { nameOf } from "ts-nameof-proxy";
import { BabelAdapter } from "../../Transformation/BabelAdapter.cjs";
import { BabelFeatures } from "../../Transformation/BabelFeatures.cjs";
import { IBabelContext } from "../../Transformation/IBabelContext.cjs";

const { writeFile } = fs;

/**
 * Registers tests for the {@linkcode BabelAdapter} class.
 */
export function BabelAdapterTests(): void
{
    suite(
        BabelAdapter.name,
        () =>
        {
            /**
             * Provides an implementation of the {@linkcode BabelAdapter} class for testing.
             */
            class TestAdapter extends BabelAdapter
            {
                /**
                 * @inheritdoc
                 *
                 * @param item
                 * The item to check.
                 *
                 * @returns
                 * A value indicating whether the specified {@linkcode item} is a call expression.
                 */
                public override IsCallExpression(item: babel.types.Node): item is babel.types.CallExpression
                {
                    return super.IsCallExpression(item);
                }

                /**
                 * @inheritdoc
                 *
                 * @param item
                 * The item to check.
                 *
                 * @returns
                 * A value indicating whether the specified {@linkcode item} is an accessor expression.
                 */
                public override IsAccessExpression(item: babel.types.Node): boolean
                {
                    return super.IsAccessExpression(item);
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
                public override IsStringLiteral(item: babel.types.Node): item is babel.types.StringLiteral
                {
                    return super.IsStringLiteral(item);
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
                public override IsTemplateLiteral(item: babel.types.Node): boolean
                {
                    return super.IsTemplateLiteral(item);
                }

                /**
                 * @inheritdoc
                 *
                 * @param arrayLiteral
                 * The array literal to get the elements from.
                 *
                 * @returns
                 * Either the elements of the {@linkcode arrayLiteral} or `undefined` if the specified {@linkcode arrayLiteral} is invalid.
                 */
                public override GetArrayElements(arrayLiteral: babel.types.Node): babel.types.Node[] | undefined
                {
                    return super.GetArrayElements(arrayLiteral);
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
                public override CreateArrayLiteral(elements: babel.types.Node[]): babel.types.Node
                {
                    return super.CreateArrayLiteral(elements);
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
                public override StoreOriginal(original: babel.types.Node, newNode: babel.types.Node): void
                {
                    super.StoreOriginal(original, newNode);
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
                public override GetOriginal(node: babel.types.Node): babel.types.Node | undefined
                {
                    return super.GetOriginal(node);
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
                public override ParseInternal(item: babel.types.Node, context: IBabelContext): ParsedNode<babel.types.Node>
                {
                    return super.ParseInternal(item, context);
                }

                /**
                 * @inheritdoc
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
                public override GetReturnExpression(block: babel.types.Block, context: IBabelContext): babel.types.Node | undefined
                {
                    return super.GetReturnExpression(block, context);
                }

                /**
                 * @inheritdoc
                 *
                 * @param item
                 * The item to dump.
                 *
                 * @returns
                 * The dumped node.
                 */
                public override Dump(item: NameofResult<babel.types.Node>): babel.types.Node
                {
                    return super.Dump(item);
                }
            }

            /**
             * Represents parameters for testing a node.
             */
            type TestParams<T> = {
                /**
                 * The state of the transformation.
                 */
                state: PluginPass;

                /**
                 * The wrapped node.
                 */
                // eslint-disable-next-line jsdoc/require-jsdoc
                node: Extract<Node, { type: T }>;
            };

            let tempFile: TempFile;
            let adapter: TestAdapter;
            let context: IBabelContext;
            let t: typeof babel.types;

            setup(
                async function()
                {
                    this.timeout(5 * 1000);
                    tempFile = new TempFile();
                    adapter = new TestAdapter(new BabelFeatures(babel));
                    let result = await wrapNode("", "File");
                    context = { state: result.state };
                    t = babel.types;
                });

            teardown(
                () =>
                {
                    tempFile.Dispose();
                });

            /**
             * Wraps a node in a file.
             *
             * @param code
             * The code of the node to wrap.
             *
             * @param type
             * The type of the node to wrap.
             *
             * @returns
             * The wrapped node.
             */
            async function wrapNode<T extends Node["type"]>(code: string, type: T): Promise<TestParams<T>>
            {
                let result: TestParams<T> = {} as any;

                await babel.transformAsync(
                    `;${code}`,
                    {
                        filename: tempFile.FullName,
                        ast: false,
                        plugins: [
                            {
                                visitor: {
                                    [type]: (path: NodePath<any>, state: PluginPass) =>
                                    {
                                        result.node = path.node;
                                        result.state = state;
                                    }
                                }
                            }
                        ]
                    });

                return result;
            }

            suite(
                nameOf<TestAdapter>((adapter) => adapter.GetNameofName),
                () =>
                {
                    test(
                        "Checking whether a custom `nameof` name can be specified…",
                        () =>
                        {
                            let nameofName = "myNameof";

                            strictEqual(
                                adapter.GetNameofName({ nameofName, state: undefined as any }),
                                nameofName);
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.GetLocation),
                () =>
                {
                    test(
                        "Checking whether the location of nodes is determined properly…",
                        async () =>
                        {
                            for (let i = 0; i <= 3; i++)
                            {
                                for (let j = 0; j <= 3; j++)
                                {
                                    let prefix = new Array(i + 1).join("\n") + new Array(j + 1).join(" ");
                                    let code = `${prefix}console;`;
                                    let location: INodeLocation | undefined;
                                    await writeFile(tempFile.FullName, code);

                                    await babel.transformAsync(
                                        code,
                                        {
                                            filename: tempFile.FullName,
                                            ast: false,
                                            plugins: [
                                                {
                                                    visitor: {
                                                        Identifier: (path, state) =>
                                                        {
                                                            location = adapter.GetLocation(path.node, { state });
                                                        }
                                                    }
                                                }
                                            ]
                                        });

                                    ok(location);
                                    strictEqual(location.filePath, tempFile.FullName);
                                    strictEqual(location.line, i);
                                    strictEqual(location.column, j);
                                }
                            }
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.GetSourceCode),
                () =>
                {
                    test(
                        "Checking whether the source code of the expression is extracted properly…",
                        async () =>
                        {
                            for (let expression of ['"use strict"', "'use strict'"])
                            {
                                let { state, node } = await wrapNode(expression, "StringLiteral");
                                strictEqual(adapter.GetSourceCode(node, { state }), expression);
                            }
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.PrintSourceCode),
                () =>
                {
                    test(
                        "Checking whether the code of nodes can be generated…",
                        () =>
                        {
                            strictEqual(
                                adapter.PrintSourceCode(t.tsAnyKeyword(), context),
                                "any");
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.IsCallExpression),
                () =>
                {
                    test(
                        "Checking whether call expressions are detected properly…",
                        () =>
                        {
                            ok(!adapter.IsCallExpression(t.stringLiteral("")));

                            ok(adapter.IsCallExpression(
                                t.callExpression(t.identifier("nameof"),
                                    [])));
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.IsAccessExpression),
                () =>
                {
                    test(
                        "Checking whether access expressions are detected properly…",
                        () =>
                        {
                            ok(!adapter.IsAccessExpression(t.numericLiteral(42)));

                            ok(adapter.IsAccessExpression(
                                t.memberExpression(
                                    t.identifier("hello"),
                                    t.identifier("world"))));

                            ok(
                                adapter.IsAccessExpression(
                                    t.memberExpression(
                                        t.identifier("rose"),
                                        t.stringLiteral("bud"),
                                        true)));
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.IsStringLiteral),
                () =>
                {
                    test(
                        "Checking whether string literals are detected properly…",
                        () =>
                        {
                            ok(!adapter.IsStringLiteral(t.numericLiteral(42)));
                            ok(adapter.IsStringLiteral(t.stringLiteral("hello world")));
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.IsTemplateLiteral),
                () =>
                {
                    test(
                        "Checking whether template literals are detected properly…",
                        () =>
                        {
                            ok(!adapter.IsTemplateLiteral(t.stringLiteral("")));
                            ok(adapter.IsTemplateLiteral(t.templateLiteral([t.templateElement({ raw: "" }, true)], [])));
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.GetArrayElements),
                () =>
                {
                    test(
                        "Checking whether the elements of arrays can be extracted…",
                        () =>
                        {
                            for (let i = 0; i < 3; i++)
                            {
                                for (let j = 0; j < 3; j++)
                                {
                                    let expected = [4, 2, 0].map((num) => t.numericLiteral(num));

                                    let array = t.arrayExpression(
                                        [
                                            ...new Array(i).fill(null),
                                            ...expected,
                                            ...new Array(j).fill(null)
                                        ]);

                                    deepStrictEqual(adapter.GetArrayElements(array), expected);
                                }
                            }
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.CreateArrayLiteral),
                () =>
                {
                    test(
                        "Checking whether array literals can be created…",
                        () =>
                        {
                            let elements = [
                                t.stringLiteral("it's"),
                                t.stringLiteral("over"),
                                t.numericLiteral(8000)
                            ];

                            let array = adapter.CreateArrayLiteral(elements);
                            ok(t.isArrayExpression(array));
                            deepStrictEqual(array.elements, elements);
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.StoreOriginal),
                () =>
                {
                    test(
                        "Checking whether original nodes can be stored in their replacements…",
                        () =>
                        {
                            let original = t.identifier("original");
                            let replacement = t.stringLiteral("replacement");
                            ok(!adapter.IsMutated(replacement, context));
                            adapter.StoreOriginal(original, replacement);
                            ok(adapter.IsMutated(replacement, context));
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.GetOriginal),
                () =>
                {
                    test(
                        "Checking whether original nodes can be fetched from their replacements…",
                        () =>
                        {
                            let original = t.identifier("original");
                            let replacement = t.stringLiteral("replacement");
                            adapter.StoreOriginal(original, replacement);
                            strictEqual(adapter.GetOriginal(replacement), original);
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.ParseInternal),
                () =>
                {
                    test(
                        "Checking whether call expressions are parsed properly…",
                        () =>
                        {
                            let node = t.callExpression(
                                t.identifier("nameof"),
                                [
                                    t.identifier("console")
                                ]);

                            let result = adapter.ParseInternal(node, context);
                            strictEqual(result.Type, NodeKind.CallExpressionNode);
                            strictEqual(result.Source, node);
                            strictEqual(result.Expression, node.callee);
                            deepStrictEqual(result.Arguments, node.arguments);
                        });

                    test(
                        "Checking whether keywords are parsed properly…",
                        () =>
                        {
                            let assertions: Array<[babel.types.Node, string]> = [
                                [t.thisExpression(), "this"],
                                [t.super(), "super"],
                                [t.tsAnyKeyword(), "any"],
                                [t.tsUnknownKeyword(), "unknown"],
                                [t.tsVoidKeyword(), "void"],
                                [t.tsNeverKeyword(), "never"],
                                [t.tsObjectKeyword(), "object"],
                                [t.tsBooleanKeyword(), "boolean"],
                                [t.tsNumberKeyword(), "number"],
                                [t.tsBigIntKeyword(), "bigint"],
                                [t.tsStringKeyword(), "string"],
                                [t.tsSymbolKeyword(), "symbol"]
                            ];

                            for (let [node, expected] of assertions)
                            {
                                let result = adapter.ParseInternal(node, context);
                                strictEqual(result.Type, NodeKind.IdentifierNode);
                                strictEqual(result.Source, node);
                                strictEqual(result.Name, expected);
                            }
                        });

                    test(
                        "Checking whether numeric literals are parsed properly…",
                        () =>
                        {
                            let node = t.numericLiteral(1337);
                            let result = adapter.ParseInternal(node, context);
                            strictEqual(result.Type, NodeKind.NumericLiteralNode);
                            strictEqual(result.Source, node);
                            strictEqual(result.Value, node.value);
                        });

                    test(
                        "Checking whether signed numeric literals are parsed properly…",
                        () =>
                        {
                            let value = 42;

                            let operators: Array<babel.types.UnaryExpression["operator"]> = [
                                "+",
                                "-"
                            ];

                            let numericNode = t.numericLiteral(value);

                            for (let operator of operators)
                            {
                                let node = t.unaryExpression(operator, numericNode);
                                let result = adapter.ParseInternal(node, context);
                                strictEqual(result.Type, NodeKind.NumericLiteralNode);
                                strictEqual(result.Source, node);
                                strictEqual(result.Value, value * (operator === "+" ? 1 : -1));
                            }
                        });

                    test(
                        "Checking whether string literals are parsed properly…",
                        () =>
                        {
                            let node = t.stringLiteral("Leerooooooooy");
                            let result = adapter.ParseInternal(node, context);
                            strictEqual(result.Type, NodeKind.StringLiteralNode);
                            strictEqual(result.Source, node);
                            strictEqual(result.Text, node.value);
                        });

                    test(
                        "Checking whether identifiers are parsed properly…",
                        () =>
                        {
                            let node = t.identifier("process");
                            let result = adapter.ParseInternal(node, context);
                            strictEqual(result.Type, NodeKind.IdentifierNode);
                            strictEqual(result.Source, node);
                            strictEqual(result.Name, node.name);
                        });

                    test(
                        "Checking whether type references are parsed properly…",
                        () =>
                        {
                            let typeName = t.identifier("Console");
                            let node = t.tsTypeReference(typeName);
                            let result = adapter.ParseInternal(node, context);
                            strictEqual(result.Type, NodeKind.IdentifierNode);
                            strictEqual(result.Source, typeName);
                            strictEqual(result.Name, typeName.name);
                        });

                    test(
                        "Checking whether import types are parsed properly…",
                        () =>
                        {
                            let typeName = t.identifier("Generator");

                            let node = t.tsImportType(
                                t.stringLiteral("yeoman-generator"),
                                typeName);

                            let result = adapter.ParseInternal(node, context);
                            strictEqual(result.Type, NodeKind.IdentifierNode);
                            strictEqual(result.Source, typeName);
                            strictEqual(result.Name, typeName.name);
                        });

                    test(
                        "Checking whether parsing import types with no qualifier throws an error…",
                        () =>
                        {
                            let node = t.tsImportType(t.stringLiteral("inquirer"));
                            throws(() => adapter.ParseInternal(node, context), MissingImportTypeQualifierError);
                        });

                    test(
                        "Checking whether unnecessary operators are ignored…",
                        () =>
                        {
                            let nestedNode = t.stringLiteral("test");

                            let node = t.tsNonNullExpression(
                                t.parenthesizedExpression(
                                    t.tsAsExpression(
                                        nestedNode,
                                        t.tSAnyKeyword())));

                            let result = adapter.ParseInternal(node, context);
                            strictEqual(result.Type, NodeKind.StringLiteralNode);
                            strictEqual(result.Source, nestedNode);
                            strictEqual(result.Text, nestedNode.value);
                        });

                    test(
                        "Checking whether member expressions are parsed properly…",
                        () =>
                        {
                            let assertions: Array<[babel.types.Expression, boolean]> = [
                                [t.identifier("log"), false],
                                [t.stringLiteral("warn"), true],
                                [t.numericLiteral(1), true]
                            ];

                            for (let assertion of assertions)
                            {
                                let node = t.memberExpression(
                                    t.identifier("console"),
                                    assertion[0],
                                    assertion[1]);

                                let result = adapter.ParseInternal(node, context);
                                let index = assertion[0];
                                strictEqual(result.Source, node);

                                if (!assertion[1])
                                {
                                    ok(t.isIdentifier(index));
                                    strictEqual(result.Type, NodeKind.PropertyAccessNode);
                                    deepStrictEqual(result.Expression, adapter.ParseInternal(node.object, context));
                                    strictEqual(result.PropertyName, index.name);
                                }
                                else
                                {
                                    strictEqual(result.Type, NodeKind.IndexAccessNode);
                                    deepStrictEqual(result.Expression, adapter.ParseInternal(node.object, context));
                                    deepStrictEqual(result.Property, adapter.ParseInternal(node.property, context));
                                }
                            }
                        });

                    test(
                        "Checking whether dotted types are parsed properly…",
                        () =>
                        {
                            let object = t.identifier("NodeJS");
                            let property = t.identifier("ReadWriteStream");
                            let node = t.tsQualifiedName(object, property);
                            let result = adapter.ParseInternal(node, context);

                            strictEqual(result.Type, NodeKind.PropertyAccessNode);
                            strictEqual(result.Source, node);
                            deepStrictEqual(result.Expression, adapter.ParseInternal(object, context));
                            strictEqual(result.PropertyName, property.name);
                        });

                    test(
                        "Checking whether indexed types are parsed properly…",
                        () =>
                        {
                            let container = t.identifier("NodeJS");

                            let indexers = [
                                t.stringLiteral("Stream"),
                                t.numericLiteral(9000)
                            ];

                            for (let index of indexers)
                            {
                                let node = t.tsIndexedAccessType(
                                    t.tsTypeReference(container),
                                    t.tsLiteralType(index));

                                let result = adapter.ParseInternal(node, context);
                                strictEqual(result.Type, NodeKind.IndexAccessNode);
                                strictEqual(result.Source, node);
                                deepStrictEqual(result.Expression, adapter.ParseInternal(container, context));
                                deepStrictEqual(result.Property, adapter.ParseInternal(index, context));
                            }
                        });

                    for (let arrowFunction of [false, true])
                    {
                        let type = "function";
                        let prefixedType: string;

                        if (arrowFunction)
                        {
                            type = `arrow ${type}`;
                            prefixedType = `an ${type}`;
                        }
                        else
                        {
                            prefixedType = `a ${type}`;
                        }

                        test(
                            `Checking whether ${type} expressions are parsed properly…`,
                            () =>
                            {
                                let returnedNode = t.stringLiteral("I'll be back!");
                                let paramNames = ["this", "is", "a", "test"];
                                let parameters = paramNames.map((name) => t.identifier(name));
                                let node: babel.Node;

                                if (arrowFunction)
                                {
                                    node = t.arrowFunctionExpression(
                                        parameters,
                                        returnedNode);
                                }
                                else
                                {
                                    node = t.functionExpression(
                                        undefined,
                                        parameters,
                                        t.blockStatement(
                                            [
                                                t.returnStatement(returnedNode)
                                            ]));
                                }

                                let result = adapter.ParseInternal(node, context);
                                strictEqual(result.Type, NodeKind.FunctionNode);
                                strictEqual(result.Source, node);
                                deepStrictEqual(result.Parameters, paramNames);
                                strictEqual(result.Body, returnedNode);
                            });

                        test(
                            `Checking whether passing a${prefixedType} with unsupported parameters throws an error…`,
                            () =>
                            {
                                let node: babel.types.Node;
                                let returnedNode = t.stringLiteral("test");
                                let unsupportedParameter = t.restElement(t.identifier("test"));

                                if (arrowFunction)
                                {
                                    node = t.arrowFunctionExpression(
                                        [unsupportedParameter],
                                        returnedNode);
                                }
                                else
                                {
                                    node = t.functionExpression(
                                        undefined,
                                        [unsupportedParameter],
                                        t.blockStatement(
                                            [
                                                t.returnStatement(returnedNode)
                                            ]));
                                }

                                throws(
                                    () => adapter.ParseInternal(node, context),
                                    UnsupportedNodeError);
                            });

                        test(
                            `Checking whether the absence of a returned expression in a${prefixedType} throws an error…`,
                            () =>
                            {
                                let node: babel.types.Node;
                                let empty = t.blockStatement([]);

                                if (arrowFunction)
                                {
                                    node = t.arrowFunctionExpression([], empty);
                                }
                                else
                                {
                                    node = t.functionExpression(undefined, [], empty);
                                }

                                throws(
                                    () => adapter.ParseInternal(node, context),
                                    NoReturnExpressionError);
                            });
                    }

                    test(
                        "Checking whether unsupported nodes are returned properly…",
                        () =>
                        {
                            let node = t.classDeclaration(t.identifier("Test"), undefined, t.classBody([]));
                            let result = adapter.ParseInternal(node, context);
                            strictEqual(result.Type, NodeKind.UnsupportedNode);
                            strictEqual(result.Source, node);
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.GetReturnExpression),
                () =>
                {
                    test(
                        "Checking whether the returned expression of functions and arrow functions is detected properly…",
                        () =>
                        {
                            let assertions: Array<[() => 42, true] | [() => void, false]> = [
                                [
                                    function()
                                    { },
                                    false
                                ],
                                [
                                    function()
                                    {
                                        console.log();
                                        console.log(20 * 7 - 2);
                                        return 42;
                                    },
                                    true
                                ],
                                [
                                    () => { },
                                    false
                                ],
                                [
                                    () =>
                                    {
                                        console.log();
                                        console.log(27 - 38 % 5);
                                    },
                                    false
                                ],
                                [
                                    () => 42,
                                    true
                                ],
                                [
                                    () =>
                                    {
                                        console.log("hello world");
                                        console.log(20 - 89);
                                        return 42;
                                    },
                                    true
                                ]
                            ];

                            for (let assertion of assertions)
                            {
                                let result: babel.types.Node | undefined;
                                let functionNode = parser.parseExpression(`${assertion[0]}`);

                                ok(
                                    t.isFunctionExpression(functionNode) ||
                                    t.isArrowFunctionExpression(functionNode));

                                if (t.isBlock(functionNode.body))
                                {
                                    result = adapter.GetReturnExpression(functionNode.body, context);
                                }
                                else
                                {
                                    result = functionNode.body;
                                }

                                if (assertion[1])
                                {
                                    ok(t.isNumericLiteral(result));
                                    strictEqual(result.value, 42);
                                }
                                else
                                {
                                    strictEqual(result, undefined);
                                }
                            }
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.Dump),
                () =>
                {
                    test(
                        "Checking whether the results are dumped properly…",
                        () =>
                        {
                            let assertions: Array<[NameofResult<Node>, string]> = [
                                [
                                    {
                                        type: ResultType.Plain,
                                        text: "console.log"
                                    },
                                    '"console.log"'
                                ],
                                [
                                    {
                                        type: ResultType.Template,
                                        templateParts: [
                                            "",
                                            " is a ",
                                            "."
                                        ],
                                        expressions: [
                                            t.thisExpression(),
                                            t.identifier("test")
                                        ]
                                    },
                                    "`${this} is a ${test}.`"
                                ],
                                [
                                    {
                                        type: ResultType.Template,
                                        templateParts: [
                                            "is ",
                                            " real?"
                                        ],
                                        expressions: [
                                            t.thisExpression()
                                        ]
                                    },
                                    "`is ${this} real?`"
                                ],
                                [
                                    {
                                        type: ResultType.Template,
                                        templateParts: [
                                            "use the ",
                                            ""
                                        ],
                                        expressions: [
                                            t.identifier("source")
                                        ]
                                    },
                                    "`use the ${source}`"
                                ],
                                [
                                    {
                                        type: ResultType.Template,
                                        templateParts: [
                                            "",
                                            ""
                                        ],
                                        expressions: [
                                            t.super()
                                        ]
                                    },
                                    "`${super}`"
                                ]
                            ];

                            for (let assertion of assertions)
                            {
                                let result = adapter.Dump(assertion[0]);
                                strictEqual(
                                    adapter.PrintSourceCode(result, context),
                                    assertion[1]);
                            }

                            let node = t.classDeclaration(
                                t.identifier("Test"),
                                null,
                                t.classBody([]));

                            strictEqual(
                                adapter.Dump(
                                    {
                                        type: ResultType.Node,
                                        node
                                    }),
                                node);
                        });
                });
        });
}
