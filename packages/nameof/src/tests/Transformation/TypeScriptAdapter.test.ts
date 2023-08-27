import { deepStrictEqual, ok, strictEqual, throws } from "assert";
import { MissingImportTypeQualifierError, NameofResult, NodeKind, ParsedNode, ResultType } from "@typescript-nameof/common";
import { printNode, Project, SourceFile, SyntaxKind, ts as tsMorph } from "ts-morph";
import { nameOf } from "ts-nameof-proxy";
// eslint-disable-next-line @typescript-eslint/tslint/config
import typescript from "typescript";
import { ITypeScriptContext } from "../../Transformation/ITypeScriptContext.cjs";
import { TypeScriptAdapter } from "../../Transformation/TypeScriptAdapter.cjs";
import { TypeScriptFeatures } from "../../Transformation/TypeScriptFeatures.cjs";

/**
 * Registers tests for the {@linkcode TypeScriptAdapter} class.
 */
export function TypeScriptAdapterTests(): void
{
    suite(
        TypeScriptAdapter.name,
        () =>
        {
            /**
             * Provides an implementation of the {@link TypeScriptAdapter} class for testing.
             */
            class TestAdapter extends TypeScriptAdapter
            {
                /**
                 * @inheritdoc
                 */
                public override get TypeScript(): typeof typescript
                {
                    return ts;
                }

                /**
                 * @inheritdoc
                 *
                 * @param item
                 * The item to check.
                 *
                 * @returns
                 * A value indicating whether the specified {@linkcode item} is a call expression.
                 */
                public override IsCallExpression(item: typescript.Node): item is typescript.CallExpression
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
                 * A value indicating whether the specified {@linkcode item} is a string literal.
                 */
                public override IsStringLiteral(item: typescript.Node): item is typescript.StringLiteral
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
                public override IsTemplateLiteral(item: typescript.Node): boolean
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
                public override GetArrayElements(arrayLiteral: typescript.Node): typescript.Node[] | undefined
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
                public override CreateArrayLiteral(elements: typescript.Node[]): typescript.Node
                {
                    return super.CreateArrayLiteral(elements);
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
                public override ParseInternal(item: typescript.Node, context: ITypeScriptContext): ParsedNode<typescript.Node>
                {
                    return super.ParseInternal(item, context);
                }

                /**
                 * @inheritdoc
                 *
                 * @param body
                 * The function body to get the return statement from.
                 *
                 * @returns
                 * The expression in the return statement of the specified {@linkcode body}.
                 */
                public override GetReturnExpression(body: typescript.ConciseBody): typescript.Node | undefined
                {
                    return super.GetReturnExpression(body);
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
                public override Dump(item: NameofResult<typescript.Node>): typescript.Node
                {
                    return super.Dump(item);
                }
            }

            let adapter: TestAdapter;
            let context: ITypeScriptContext;
            let file: SourceFile;
            let ts: typeof typescript;

            /**
             * Represents test parameters.
             */
            type TestParams = {
                /**
                 * The node to test.
                 */
                node: typescript.Node;

                /**
                 * The context of the node.
                 */
                context: ITypeScriptContext;
            };

            /**
             * Wraps the node with the specified {@linkcode code} and {@linkcode kind}.
             *
             * @param code
             * The code to wrap in a file.
             *
             * @param kind
             * The kind of the node to wrap.
             *
             * @returns
             * The node and the context for running tests.
             */
            function wrapNode(code: string, kind: SyntaxKind): TestParams
            {
                file.replaceWithText(code);

                return {
                    node: file.getFirstDescendantByKindOrThrow(kind).compilerNode as any,
                    context: { file: file.compilerNode as any }
                };
            }

            setup(
                () =>
                {
                    ts = tsMorph as any;
                    adapter = new TestAdapter(new TypeScriptFeatures());
                    file = new Project().createSourceFile("/file.ts");
                    context = { file: file.compilerNode as any };
                });

            teardown(
                () =>
                {
                    file.forget();
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.GetLocation),
                () =>
                {
                    test(
                        "Checking whether the location of the node is detected properly…",
                        () =>
                        {
                            for (let i = 0; i < 10; i++)
                            {
                                for (let j = 0; j < 10; j++)
                                {
                                    let prefix = new Array(i + 1).join("\n") + new Array(j + 1).join(" ");
                                    let sourceFile = new Project().createSourceFile("/file.ts", `${prefix}let x = 0;`);
                                    let file: typescript.SourceFile = sourceFile.compilerNode as any;
                                    let node: typescript.Node = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.VariableDeclarationList).compilerNode as any;
                                    let location = adapter.GetLocation(node, { file });
                                    strictEqual(location.filePath, file.fileName);
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
                        "Checking whether the code of the specified node can be dumped properly…",
                        () =>
                        {
                            let typeKeyword = "void";
                            let sourceFile = new Project().createSourceFile("/file.ts", `let x: Promise<${typeKeyword}>`);
                            let file: typescript.SourceFile = sourceFile.compilerNode as any;
                            let node: typescript.Node = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.VoidKeyword).compilerNode as any;
                            strictEqual(adapter.GetSourceCode(node, { file }), typeKeyword);
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.PrintSourceCode),
                () =>
                {
                    test(
                        "Checking whether code for nodes which do not belong to a file can be printed…",
                        () =>
                        {
                            let node = ts.factory.createThis();
                            strictEqual(adapter.PrintSourceCode(node, context), "this");
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
                            ok(
                                adapter.IsCallExpression(
                                    ts.factory.createCallExpression(
                                        ts.factory.createIdentifier("nameof"),
                                        [],
                                        [])));
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
                            ok(adapter.IsStringLiteral(ts.factory.createStringLiteral("console")));
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
                            ok(
                                adapter.IsTemplateLiteral(
                                    ts.factory.createTemplateExpression(
                                        ts.factory.createTemplateHead("hello world"),
                                        [])));
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.GetArrayElements),
                () =>
                {
                    test(
                        "Checking whether elements can be extracted from array literals…",
                        () =>
                        {
                            let node = ts.factory.createThis();
                            let elements = [node, node, node];

                            deepStrictEqual(
                                adapter.GetArrayElements(
                                    ts.factory.createArrayLiteralExpression(
                                        elements)),
                                elements);
                        });

                    test(
                        `Checking whether \`${undefined}\` is returned if no array literal is passed…`,
                        () =>
                        {
                            strictEqual(adapter.GetArrayElements(ts.factory.createThis()), undefined);
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.CreateArrayLiteral),
                () =>
                {
                    test(
                        "Checking whether array literals are created properly…",
                        () =>
                        {
                            let elements: typescript.Node[] = [];

                            for (let i = 0; i < 3; i++)
                            {
                                elements.push(ts.factory.createNumericLiteral(i));
                            }

                            let result = adapter.CreateArrayLiteral(elements);
                            ok(ts.isArrayLiteralExpression(result));
                            deepStrictEqual([...result.elements], elements);
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
                            let callExpression = ts.factory.createCallExpression(
                                ts.factory.createIdentifier("nameof"),
                                [
                                    ts.factory.createTypeReferenceNode("Console")
                                ],
                                [
                                    ts.factory.createThis()
                                ]);

                            let result = adapter.ParseInternal(callExpression, context);
                            strictEqual(result.Type, NodeKind.CallExpressionNode);
                            strictEqual(result.Source, callExpression);
                            strictEqual(result.Expression, callExpression.expression);
                            deepStrictEqual([...result.TypeArguments], [...(callExpression.typeArguments ?? [])]);
                            deepStrictEqual([...result.Arguments], [...callExpression.arguments]);
                        });

                    test(
                        "Checking whether keywords are parsed properly…",
                        () =>
                        {
                            let nodes = [
                                ts.factory.createThis(),
                                ts.factory.createSuper(),
                                ...(
                                    [
                                        ts.SyntaxKind.AnyKeyword,
                                        ts.SyntaxKind.UnknownKeyword,
                                        ts.SyntaxKind.VoidKeyword,
                                        ts.SyntaxKind.NeverKeyword,
                                        ts.SyntaxKind.ObjectKeyword,
                                        ts.SyntaxKind.BooleanKeyword,
                                        ts.SyntaxKind.NumberKeyword,
                                        ts.SyntaxKind.BigIntKeyword,
                                        ts.SyntaxKind.StringKeyword,
                                        ts.SyntaxKind.SymbolKeyword
                                    ] as typescript.KeywordTypeSyntaxKind[]
                                ).map(
                                    (keyword) =>
                                    {
                                        return ts.factory.createKeywordTypeNode(keyword);
                                    })
                            ];

                            for (let node of nodes)
                            {
                                let result = adapter.ParseInternal(node, context);
                                strictEqual(result.Type, NodeKind.IdentifierNode);
                                strictEqual(result.Source, node);
                                strictEqual(result.Name, printNode(node as any));
                            }
                        });

                    test(
                        "Checking whether numeric literals are parsed properly…",
                        () =>
                        {
                            let value = 420;
                            let node = ts.factory.createNumericLiteral(value);
                            let result = adapter.ParseInternal(node, context);
                            strictEqual(result.Type, NodeKind.NumericLiteralNode);
                            strictEqual(result.Source, node);
                            strictEqual(result.Value, value);
                        });

                    test(
                        "Checking whether signed numeric literals are parsed properly…",
                        () =>
                        {
                            let value = 1337;
                            let numberNode = ts.factory.createNumericLiteral(value);

                            for (let positive of [true, false])
                            {
                                let node = ts.factory.createPrefixUnaryExpression(
                                    positive ? ts.SyntaxKind.PlusToken : ts.SyntaxKind.MinusToken,
                                    numberNode);

                                let result = adapter.ParseInternal(node, context);
                                strictEqual(result.Type, NodeKind.NumericLiteralNode);
                                strictEqual(result.Source, node);
                                strictEqual(result.Value, value * (positive ? 1 : -1));
                            }
                        });

                    test(
                        "Checking whether string literals are parsed properly…",
                        () =>
                        {
                            let value = "It's dangerous to go alone!";
                            let node = ts.factory.createStringLiteral(value);
                            let result = adapter.ParseInternal(node, context);
                            strictEqual(result.Type, NodeKind.StringLiteralNode);
                            strictEqual(result.Source, node);
                            strictEqual(result.Text, value);
                        });

                    test(
                        "Checking whether identifiers are parsed properly…",
                        () =>
                        {
                            let name = "process";
                            let node = ts.factory.createIdentifier(name);
                            let result = adapter.ParseInternal(node, context);
                            strictEqual(result.Type, NodeKind.IdentifierNode);
                            strictEqual(result.Source, node);
                            strictEqual(result.Name, name);
                        });

                    test(
                        "Checking whether type references are parsed properly…",
                        () =>
                        {
                            let name = "Console";
                            let node = ts.factory.createTypeReferenceNode(name);
                            let result = adapter.ParseInternal(node, context);
                            strictEqual(result.Type, NodeKind.IdentifierNode);
                            strictEqual(result.Source, node.typeName);
                            strictEqual(result.Name, name);
                        });

                    test(
                        "Checking whether import types are parsed properly…",
                        () =>
                        {
                            let name = "Generator";

                            let node = ts.factory.createImportTypeNode(
                                ts.factory.createLiteralTypeNode(
                                    ts.factory.createStringLiteral("yeoman-generator")),
                                undefined,
                                ts.factory.createIdentifier(name));

                            let result = adapter.ParseInternal(node, context);
                            strictEqual(result.Type, NodeKind.IdentifierNode);
                            strictEqual(result.Source, node.qualifier);
                            strictEqual(result.Name, name);
                        });

                    test(
                        "Checking whether an error is thrown if no import type qualifier is specified…",
                        () =>
                        {
                            let node = ts.factory.createImportTypeNode(
                                ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral("inquirer")));

                            throws(
                                () => adapter.ParseInternal(node, context),
                                MissingImportTypeQualifierError);
                        });

                    test(
                        "Checking whether unnecessary operators are ignored…",
                        () =>
                        {
                            let value = 1337;
                            let node = ts.factory.createNumericLiteral(value);

                            let result = adapter.ParseInternal(
                                ts.factory.createNonNullExpression(
                                    ts.factory.createParenthesizedExpression(
                                        ts.factory.createAsExpression(
                                            node,
                                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)))),
                                context);

                            strictEqual(result.Type, NodeKind.NumericLiteralNode);
                            strictEqual(result.Source, node);
                            strictEqual(result.Value, value);
                        });

                    test(
                        "Checking whether property access chains are parsed properly…",
                        () =>
                        {
                            let objectName = "process";
                            let accessor = "chdir";

                            let node = ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier(objectName),
                                accessor);

                            let result = adapter.ParseInternal(node, context);
                            strictEqual(result.Type, NodeKind.PropertyAccessNode);
                            strictEqual(result.Source, node);
                            deepStrictEqual(result.Expression, adapter.ParseInternal(node.expression, context));
                            strictEqual(result.PropertyName, accessor);
                        });

                    test(
                        "Checking whether qualified names are parsed properly…",
                        () =>
                        {
                            let outer = "Inquirer";
                            let inner = "Question";

                            let node = ts.factory.createQualifiedName(
                                ts.factory.createIdentifier(outer),
                                ts.factory.createIdentifier(inner));

                            let result = adapter.ParseInternal(node, context);
                            strictEqual(result.Type, NodeKind.PropertyAccessNode);
                            strictEqual(result.Source, node);
                            deepStrictEqual(result.Expression, adapter.ParseInternal(node.left, context));
                            strictEqual(result.PropertyName, inner);
                        });

                    test(
                        "Checking whether element access expressions are parsed properly…",
                        () =>
                        {
                            let objectName = "files";

                            let indexers = [
                                0,
                                ts.factory.createStringLiteral("You shall pass!")
                            ];

                            for (let index of indexers)
                            {
                                let node = ts.factory.createElementAccessExpression(
                                    ts.factory.createIdentifier(objectName),
                                    index);

                                let result = adapter.ParseInternal(node, context);
                                strictEqual(result.Type, NodeKind.IndexAccessNode);
                                strictEqual(result.Source, node);
                                deepStrictEqual(result.Expression, adapter.ParseInternal(node.expression, context));
                                deepStrictEqual(result.Index, adapter.ParseInternal(node.argumentExpression, context));

                                if (typeof index === "number")
                                {
                                    strictEqual(result.Index.Type, NodeKind.NumericLiteralNode);
                                    strictEqual(result.Index.Source, node.argumentExpression);
                                    strictEqual(result.Index.Value, index);
                                }
                                else
                                {
                                    strictEqual(result.Index.Type, NodeKind.StringLiteralNode);
                                    strictEqual(result.Index.Source, index);
                                    strictEqual(result.Index.Text, index.text);
                                }
                            }
                        });

                    test(
                        "Checking whether indexed access types are parsed properly…",
                        () =>
                        {
                            let typeName = "NodeSet";
                            let index = "TKey";

                            let node = ts.factory.createIndexedAccessTypeNode(
                                ts.factory.createTypeReferenceNode(typeName),
                                ts.factory.createTypeReferenceNode(index));

                            let result = adapter.ParseInternal(node, context);
                            strictEqual(result.Type, NodeKind.IndexAccessNode);
                            strictEqual(result.Source, node);
                            deepStrictEqual(result.Expression, adapter.ParseInternal(node.objectType, context));
                            deepStrictEqual(result.Index, adapter.ParseInternal(node.indexType, context));
                        });

                    test(
                        "Checking whether function expressions are parsed properly…",
                        () =>
                        {
                            let numericNode = ts.factory.createNumericLiteral(10);

                            let paramNames = ["a", "b", "x", "y"];

                            let node = ts.factory.createFunctionExpression(
                                [],
                                undefined,
                                undefined,
                                [],
                                paramNames.map(
                                    (paramName) =>
                                    {
                                        return ts.factory.createParameterDeclaration(
                                            undefined,
                                            undefined,
                                            paramName);
                                    }),
                                undefined,
                                ts.factory.createBlock(
                                    [
                                        ts.factory.createReturnStatement(numericNode)
                                    ]));

                            let result = adapter.ParseInternal(node, context);
                            strictEqual(result.Type, NodeKind.FunctionNode);
                            strictEqual(result.Source, node);
                            deepStrictEqual(result.Parameters, paramNames);
                            strictEqual(result.Body, numericNode);
                        });

                    test(
                        "Checking whether arrow functions are parsed properly…",
                        () =>
                        {
                            let numericNode = ts.factory.createNumericLiteral(42);

                            let node = ts.factory.createArrowFunction(
                                [],
                                undefined,
                                [],
                                undefined,
                                undefined,
                                numericNode);

                            let result = adapter.ParseInternal(node, context);
                            strictEqual(result.Type, NodeKind.FunctionNode);
                            strictEqual(result.Source, node);
                            deepStrictEqual(result.Parameters, []);
                            strictEqual(result.Body, numericNode);
                        });

                    test(
                        "Checking whether other nodes return an unsupported node…",
                        () =>
                        {
                            let node = ts.factory.createClassDeclaration([], "Test", undefined, undefined, []);
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
                        "Checking whether return expressions in functions can be found…",
                        () =>
                        {
                            let assertions: Array<[() => any, boolean]> = [
                                [
                                    function()
                                    {
                                        console.log();
                                        console.log(20 - 2 * 7);
                                        process.chdir("/");
                                        return 1337;
                                    },
                                    true
                                ],
                                [
                                    function()
                                    { },
                                    false
                                ],
                                [
                                    () => 1337,
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
                                        Math.abs(7);
                                        return 1337;
                                    },
                                    true
                                ],
                                [
                                    () =>
                                    {
                                        console.log();
                                        Math.abs(7);
                                    },
                                    false
                                ]
                            ];

                            for (let assertion of assertions)
                            {
                                let result: TestParams;
                                let code = `let x = ${assertion[0]}`;

                                try
                                {
                                    result = wrapNode(code, SyntaxKind.FunctionExpression);
                                }
                                catch
                                {
                                    result = wrapNode(code, SyntaxKind.ArrowFunction);
                                }

                                let { node } = result;
                                ok(ts.isFunctionExpression(node) || ts.isArrowFunction(node));
                                let expression = adapter.GetReturnExpression(node.body);

                                if (assertion[1])
                                {
                                    ok(expression);
                                    ok(ts.isNumericLiteral(expression));
                                    strictEqual(expression.text, `${1337}`);
                                }
                                else
                                {
                                    strictEqual(expression, undefined);
                                }
                            }
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.Dump),
                () =>
                {
                    /**
                     * Asserts the result of a dump method.
                     *
                     * @param result
                     * The nameof result to dump.
                     *
                     * @param expected
                     * The expected result.
                     */
                    function assertDump(result: NameofResult<typescript.Node>, expected: string): void
                    {
                        strictEqual(printNode(adapter.Dump(result) as any), expected);
                    }

                    test(
                        "Checking whether plain text results are dumped properly…",
                        () =>
                        {
                            let text = "console";

                            assertDump(
                                {
                                    type: ResultType.Plain,
                                    text
                                },
                                JSON.stringify(text));
                        });

                    test(
                        "Checking whether template results are dumped properly…",
                        () =>
                        {
                            let thisExpression = ts.factory.createThis();

                            assertDump(
                                {
                                    type: ResultType.Template,
                                    expressions: [
                                        thisExpression
                                    ],
                                    templateParts: [
                                        "",
                                        ""
                                    ]
                                },
                                "`${this}`");

                            assertDump(
                                {
                                    type: ResultType.Template,
                                    expressions: [
                                        thisExpression
                                    ],
                                    templateParts: [
                                        "",
                                        " is a test."
                                    ]
                                },
                                "`${this} is a test.`");

                            assertDump(
                                {
                                    type: ResultType.Template,
                                    expressions: [
                                        thisExpression,
                                        thisExpression
                                    ],
                                    templateParts: [
                                        "I said: ",
                                        " is equal to ",
                                        "!"
                                    ]
                                },
                                "`I said: ${this} is equal to ${this}!`");
                        });

                    test(
                        "Checking whether node results are dumped properly…",
                        () =>
                        {
                            let node = ts.factory.createIdentifier("test");

                            assertDump(
                                {
                                    type: ResultType.Node,
                                    node
                                },
                                printNode(node as any));
                        });
                });
        });
}
