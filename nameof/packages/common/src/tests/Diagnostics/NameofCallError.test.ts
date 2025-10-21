import { strictEqual } from "node:assert";
import { createSandbox, SinonSandbox, SinonStubbedInstance } from "sinon";
import { nameOf } from "ts-nameof-proxy";
import { NameofCallError } from "../../Diagnostics/NameofCallError.cjs";
import { NameofFunction } from "../../NameofFunction.cjs";
import { NameofCall } from "../../Serialization/NameofCall.cjs";
import { Adapter } from "../../Transformation/Adapter.cjs";

/**
 * Registers tests for the {@linkcode NameofCallError} class.
 */
export function NameofCallErrorTests(): void
{
    suite(
        NameofCallError.name,
        () =>
        {
            /**
             * Provides an implementation of the {@linkcode NameofCallError} class for testing.
             */
            class TestError extends NameofCallError<any, any, any>
            {
                /**
                 * @inheritdoc
                 */
                public override get FunctionName(): string
                {
                    return super.FunctionName;
                }

                /**
                 * @inheritdoc
                 */
                public override get Arguments(): readonly any[]
                {
                    return super.Arguments;
                }

                /**
                 * @inheritdoc
                 */
                public override get TypeArguments(): readonly any[]
                {
                    return super.TypeArguments;
                }

                /**
                 * @inheritdoc
                 */
                public override get ArgumentCountText(): string
                {
                    return super.ArgumentCountText;
                }

                /**
                 * @inheritdoc
                 */
                public override get TypeArgumentCountText(): string
                {
                    return super.TypeArgumentCountText;
                }

                /**
                 * @inheritdoc
                 */
                protected override get Message(): string
                {
                    return "";
                }

                /**
                 * @inheritdoc
                 *
                 * @param amount
                 * The number of entities to get the plural suffix for.
                 *
                 * @returns
                 * The proper suffix for the specified {@linkcode amount}.
                 */
                public override GetPluralSuffix(amount: number): string
                {
                    return super.GetPluralSuffix(amount);
                }
            }

            let sandbox: SinonSandbox;
            let error: TestError;
            let nameofCall: NameofCall<any>;
            let adapter: SinonStubbedInstance<Adapter<any, any, any>>;

            suiteSetup(
                () =>
                {
                    sandbox = createSandbox();
                });

            setup(
                () =>
                {
                    nameofCall = {
                        source: {},
                        arguments: [],
                        typeArguments: []
                    };

                    adapter = sandbox.createStubInstance(Adapter);
                    adapter.GetNameofName.callThrough();
                    error = new TestError(adapter, nameofCall, {});
                });

            teardown(
                () =>
                {
                    sandbox.restore();
                });

            suite(
                nameOf<TestError>((error) => error.FunctionName),
                () =>
                {
                    /**
                     * Asserts that the proper function names are returned.
                     */
                    function expectCorrectNames(): void
                    {
                        for (let name of [undefined, NameofFunction.Array, NameofFunction.Full])
                        {
                            let expected = adapter.GetNameofName({});
                            nameofCall.function = name;

                            if (name)
                            {
                                expected += `.${name}`;
                            }

                            strictEqual(error.FunctionName, expected);
                        }
                    }

                    test(
                        "Checking whether the name of the function which was called is returned…",
                        () =>
                        {
                            expectCorrectNames();
                        });

                    test(
                        "Checking whether custom `nameof` names are respected…",
                        () =>
                        {
                            adapter.GetNameofName.returns("myCustomNameof");
                            expectCorrectNames();
                        });
                });

            suite(
                nameOf<TestError>((error) => error.Arguments),
                () =>
                {
                    test(
                        "Checking whether the arguments of the call are returned…",
                        () =>
                        {
                            strictEqual(error.Arguments, nameofCall.arguments);
                        });
                });

            suite(
                nameOf<TestError>((error) => error.TypeArguments),
                () =>
                {
                    test(
                        "Checking whether the type arguments of the call are returned…",
                        () =>
                        {
                            strictEqual(error.TypeArguments, nameofCall.typeArguments);
                        });
                });

            suite(
                nameOf<TestError>((error) => error.ArgumentCountText),
                () =>
                {
                    test(
                        "Checking whether the number of arguments is returned properly…",
                        () =>
                        {
                            for (let count of [0, 1, 2, 3])
                            {
                                let expected = `${count} argument`;
                                nameofCall.arguments = new Array(count);

                                if (count !== 1)
                                {
                                    expected += "s";
                                }

                                strictEqual(error.ArgumentCountText, expected);
                            }
                        });
                });

            suite(
                nameOf<TestError>((error) => error.TypeArgumentCountText),
                () =>
                {
                    test(
                        "Checking whether the number of type arguments is returned properly…",
                        () =>
                        {
                            for (let count of [0, 1, 2, 3])
                            {
                                let expected = `${count} type argument`;
                                nameofCall.typeArguments = new Array(count);

                                if (count !== 1)
                                {
                                    expected += "s";
                                }

                                strictEqual(error.TypeArgumentCountText, expected);
                            }
                        });
                });

            suite(
                nameOf<TestError>((error) => error.GetPluralSuffix),
                () =>
                {
                    test(
                        "Checking whether the plural `s` is returned properly…",
                        () =>
                        {
                            for (let count of [0, 1, 2, 3])
                            {
                                strictEqual(error.GetPluralSuffix(count), count === 1 ? "" : "s");
                            }
                        });
                });
        });
}
