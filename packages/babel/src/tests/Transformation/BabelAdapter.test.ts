import { deepStrictEqual, ok, strictEqual } from "assert";
import babel, { Node, NodePath, PluginPass } from "@babel/core";
import { TempFile } from "@manuth/temp-files";
import { INodeLocation } from "@typescript-nameof/common";
import fs from "fs-extra";
import { nameOf } from "ts-nameof-proxy";
import { BabelAdapter } from "../../Transformation/BabelAdapter.cjs";
import { BabelFeatures } from "../../Transformation/BabelFeatures.cjs";

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

            let adapter: TestAdapter;
            let tempFile: TempFile;

            setup(
                () =>
                {
                    adapter = new TestAdapter(new BabelFeatures(babel));
                    tempFile = new TempFile();
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
                                adapter.PrintSourceCode(babel.types.tsAnyKeyword(), { } as any),
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
                            ok(!adapter.IsCallExpression(babel.types.stringLiteral("")));

                            ok(adapter.IsCallExpression(
                                babel.types.callExpression(babel.types.identifier("nameof"),
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
                            ok(!adapter.IsStringLiteral(babel.types.numericLiteral(42)));
                            ok(adapter.IsStringLiteral(babel.types.stringLiteral("hello world")));
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
                            ok(!adapter.IsTemplateLiteral(babel.types.stringLiteral("")));
                            ok(adapter.IsTemplateLiteral(babel.types.templateLiteral([babel.types.templateElement({ raw: "" }, true)], [])));
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
                                    let expected = [4, 2, 0].map((num) => babel.types.numericLiteral(num));

                                    let array = babel.types.arrayExpression(
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
                                babel.types.stringLiteral("it's"),
                                babel.types.stringLiteral("over"),
                                babel.types.numericLiteral(8000)
                            ];

                            let array = adapter.CreateArrayLiteral(elements);
                            ok(babel.types.isArrayExpression(array));
                            deepStrictEqual(array.elements, elements);
                        });
                });
        });
}
