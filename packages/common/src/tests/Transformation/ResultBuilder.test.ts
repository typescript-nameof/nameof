import { deepStrictEqual, ok, strictEqual } from "node:assert";
import { createSandbox, SinonSandbox } from "sinon";
import { nameOf } from "ts-nameof-proxy";
import { Identifier, State } from "./State.js";
import { TestAdapter } from "./TestAdapter.js";
import { ResultType } from "../../ResultType.cjs";
import { IIdentifier } from "../../Serialization/IIdentifier.cjs";
import { IIndexAccessor } from "../../Serialization/IIndexAccessor.cjs";
import { IInterpolation } from "../../Serialization/IInterpolation.cjs";
import { INamedPathPart } from "../../Serialization/INamedPathPart.cjs";
import { IPropertyAccessor } from "../../Serialization/IPropertyAccessor.cjs";
import { NodeKind } from "../../Serialization/NodeKind.cjs";
import { PathKind } from "../../Serialization/PathKind.cjs";
import { PathPart } from "../../Serialization/PathPart.cjs";
import { ITransformationContext } from "../../Transformation/ITransformationContext.cjs";
import { ResultBuilder } from "../../Transformation/ResultBuilder.cjs";
import { TransformerFeatures } from "../../Transformation/TransformerFeatures.cjs";

/**
 * Registers tests for the {@linkcode ResultBuilder} class.
 */
export function ResultBuilderTests(): void
{
    suite(
        ResultBuilder.name,
        () =>
        {
            /**
             * Provides an implementation of the {@linkcode ResultBUilder} class for testing.
             */
            class TestResultBuilder extends ResultBuilder<State, State, ITransformationContext<State>>
            {
                /**
                 * @inheritdoc
                 */
                public override get Context(): ITransformationContext<State>
                {
                    return super.Context;
                }

                /**
                 * @inheritdoc
                 */
                public override get Empty(): boolean
                {
                    return super.Empty;
                }

                /**
                 * @inheritdoc
                 */
                public override get TemplateParts(): string[]
                {
                    return super.TemplateParts;
                }

                /**
                 * @inheritdoc
                 */
                public override get Expressions(): State[]
                {
                    return super.Expressions;
                }

                /**
                 * @inheritdoc
                 */
                public override get Current(): string
                {
                    return super.Current;
                }

                /**
                 * @inheritdoc
                 */
                public override set Current(value: string)
                {
                    super.Current = value;
                }

                /**
                 * @inheritdoc
                 *
                 * @param expression
                 * The expression to add.
                 */
                public override Push(expression: State): void
                {
                    super.Push(expression);
                }
            }

            /**
             * Represents a path part which does not imply an interpolation.
             */
            type PlainPath =
                IIdentifier<State> |
                IIndexAccessor<State> |
                IPropertyAccessor<State>;

            let sandbox: SinonSandbox;
            let builder: TestResultBuilder;
            let context: ITransformationContext<State>;
            let node: State;
            let adapter: TestAdapter;
            let identifierPath: IIdentifier<State>;
            let propertyPath: IPropertyAccessor<State>;
            let indexPath: IIndexAccessor<State>;
            let interpolationPath: IInterpolation<State>;

            suiteSetup(
                () =>
                {
                    sandbox = createSandbox();
                });

            setup(
                () =>
                {
                    adapter = new TestAdapter(new TransformerFeatures());
                    context = {};
                    builder = new TestResultBuilder(adapter, context);

                    node = {
                        type: NodeKind.IdentifierNode,
                        name: "console"
                    } as Identifier;

                    identifierPath = {
                        type: PathKind.Identifier,
                        source: node,
                        value: node.name
                    };

                    propertyPath = {
                        type: PathKind.PropertyAccess,
                        source: node,
                        value: "log"
                    };

                    indexPath = {
                        type: PathKind.IndexAccess,
                        source: node,
                        value: 0
                    };

                    interpolationPath = {
                        type: PathKind.Interpolation,
                        source: node,
                        node
                    };
                });

            teardown(
                () =>
                {
                    sandbox.restore();
                });

            suite(
                nameOf<TestResultBuilder>((builder) => builder.Result),
                () =>
                {
                    test(
                        "Checking whether a template result is returned if an interpolation is in the queue…",
                        () =>
                        {
                            let assertions = [
                                PathKind.Identifier,
                                PathKind.IndexAccess,
                                PathKind.PropertyAccess
                            ];

                            for (let pathKind of assertions)
                            {
                                builder.Add(
                                    {
                                        type: pathKind,
                                        source: node,
                                        value: "x"
                                    } as INamedPathPart<State, string | number> as PlainPath);

                                strictEqual(builder.Result.type, ResultType.Plain);
                                ok(typeof builder.Result.text === "string");
                            }

                            builder.Add(
                                {
                                    type: PathKind.Interpolation,
                                    source: node,
                                    node
                                } as IInterpolation<State>);

                            strictEqual(builder.Result.type, ResultType.Template);
                        });

                    test(
                        "Checking whether all template spans are included in the result…",
                        () =>
                        {
                            builder.Add(
                                {
                                    type: PathKind.Identifier,
                                    source: node,
                                    value: "files"
                                });

                            builder.Add(
                                {
                                    type: PathKind.Interpolation,
                                    source: node,
                                    node
                                });

                            strictEqual(builder.Result.type, ResultType.Template);
                            strictEqual(builder.Result.templateParts.length, 2);
                            strictEqual(builder.Result.expressions.length, 1);

                            builder.Add(
                                {
                                    type: PathKind.PropertyAccess,
                                    source: node,
                                    value: "content"
                                });

                            builder.Add(
                                {
                                    type: PathKind.Interpolation,
                                    source: node,
                                    node
                                });

                            strictEqual(builder.Result.type, ResultType.Template);
                            strictEqual(builder.Result.templateParts.length, 3);
                            strictEqual(builder.Result.expressions.length, 2);
                        });
                });

            suite(
                nameOf<TestResultBuilder>((builder) => builder.Empty),
                () =>
                {
                    test(
                        "Checking whether the builder is flagged as empty if there is no content…",
                        () =>
                        {
                            let assertions: Array<PathPart<State>> = [
                                {
                                    type: PathKind.Identifier,
                                    source: node,
                                    value: "console"
                                },
                                {
                                    type: PathKind.PropertyAccess,
                                    source: node,
                                    value: "log"
                                },
                                {
                                    type: PathKind.IndexAccess,
                                    source: node,
                                    value: "bind"
                                },
                                {
                                    type: PathKind.Interpolation,
                                    source: node,
                                    node
                                }
                            ];

                            for (let assertion of assertions)
                            {
                                builder = new TestResultBuilder(adapter, {});
                                ok(builder.Empty);
                                builder.Add(assertion);
                                ok(!builder.Empty);
                            }
                        });
                });

            suite(
                nameOf<TestResultBuilder>((builder) => builder.Add),
                () =>
                {
                    test(
                        "Checking whether identifiers and property accessors at the beginning are dumped properly…",
                        () =>
                        {
                            builder.Add(identifierPath);
                            strictEqual(builder.Result.type, ResultType.Plain);
                            strictEqual(builder.Result.text, identifierPath.value);

                            builder = new TestResultBuilder(adapter, {});
                            builder.Add(propertyPath);
                            strictEqual(builder.Result.type, ResultType.Plain);
                            strictEqual(builder.Result.text, propertyPath.value);
                        });

                    test(
                        "Checking whether following identifiers and property accessors are dumped properly…",
                        () =>
                        {
                            for (let part of [identifierPath, propertyPath])
                            {
                                builder = new TestResultBuilder(adapter, {});
                                builder.Add(identifierPath);
                                builder.Add(part);
                                strictEqual(builder.Result.type, ResultType.Plain);
                                strictEqual(builder.Result.text, `${identifierPath.value}.${part.value}`);
                            }
                        });

                    test(
                        "Checking whether index access nodes are dumped properly…",
                        () =>
                        {
                            indexPath.value = 420;
                            builder.Add(indexPath);
                            strictEqual(builder.Result.type, ResultType.Plain);
                            strictEqual(builder.Result.text, `[${indexPath.value}]`);

                            builder = new TestResultBuilder(adapter, {});
                            indexPath.value = "test";
                            builder.Add(indexPath);
                            strictEqual(builder.Result.type, ResultType.Plain);
                            strictEqual(builder.Result.text, `["${indexPath.value}"]`);
                        });

                    test(
                        "Checking whether processed interpolation calls are removed from the context…",
                        () =>
                        {
                            context.interpolationCalls = [
                                node
                            ];

                            interpolationPath.source = { ...node };
                            builder.Add(interpolationPath);
                            strictEqual(context.interpolationCalls.length, 1);
                            strictEqual(context.interpolationCalls[0], node);

                            interpolationPath.source = node;
                            builder.Add(interpolationPath);
                            strictEqual(context.interpolationCalls.length, 0);
                        });

                    test(
                        `Checking whether interpolations are redirected to the \`${nameOf<TestResultBuilder>((builder) => builder.Push)}\` method…`,
                        () =>
                        {
                            let stub = sandbox.stub(builder, "Push");
                            builder.Add(interpolationPath);
                            ok(stub.calledWith(interpolationPath.node));
                        });
                });

            suite(
                nameOf<TestResultBuilder>((builder) => builder.Push),
                () =>
                {
                    test(
                        "Checking whether template parts are pushed onto the stack properly…",
                        () =>
                        {
                            let prefixes: Array<Array<PathPart<State>>> = [
                                    [],
                                    [identifierPath],
                                    [identifierPath, propertyPath],
                                    [interpolationPath]
                            ];

                            for (let prefix of prefixes)
                            {
                                builder = new TestResultBuilder(adapter, context);

                                for (let part of prefix)
                                {
                                    builder.Add(part);
                                }

                                let spanCount = builder.TemplateParts.length;
                                let current = builder.Current;
                                let expressions = [...builder.Expressions];
                                builder.Push(interpolationPath.node);

                                for (let i = 0; i < spanCount; i++)
                                {
                                    strictEqual(builder.TemplateParts[i], builder.TemplateParts[i]);
                                }

                                strictEqual(builder.TemplateParts[spanCount], `${current}[`);
                                strictEqual(builder.Current, "]");
                                deepStrictEqual(builder.Expressions, [...expressions, interpolationPath.node]);
                            }
                        });
                });
        });
}
