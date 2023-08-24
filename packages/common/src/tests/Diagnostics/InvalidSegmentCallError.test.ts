import { ok } from "assert";
import { createSandbox, SinonSandbox, SinonStubbedInstance } from "sinon";
import { nameOf } from "ts-nameof-proxy";
import { InvalidSegmentCallError } from "../../Diagnostics/InvalidSegmentCallError.cjs";
import { Adapter } from "../../index.cjs";
import { NameofFunction } from "../../NameofFunction.cjs";
import { NameofCall } from "../../Serialization/NameofCall.cjs";

/**
 * Registers tests for the {@linkcode InvalidArgumentCountError} class.
 */
export function InvalidSegmentCallErrorTests(): void
{
    suite(
        InvalidSegmentCallError.name,
        () =>
        {
            /**
             * Provides an implementation of the {@linkcode InvalidSegmentCallError} class for testing.
             */
            class TestError extends InvalidSegmentCallError<any, any, any>
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
                public override get Message(): string
                {
                    return super.Message;
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
                    adapter = sandbox.createStubInstance(Adapter);
                    adapter.GetNameofName.callThrough();

                    nameofCall = {
                        source: {},
                        arguments: [],
                        typeArguments: []
                    };

                    error = new TestError(adapter, nameofCall, {});
                });

            teardown(
                () =>
                {
                    sandbox.restore();
                });

            suite(
                nameOf<TestError>((error) => error.Message),
                () =>
                {
                    test(
                        "Checking whether the error message includes the name of the function that has been called…",
                        () =>
                        {
                            for (let functionName of [NameofFunction.Full, NameofFunction.Split])
                            {
                                nameofCall.function = functionName;
                                ok(error.Message.includes(`\`${error.FunctionName}\``));
                            }
                        });

                    test(
                        "Checking whether the number of arguments and type arguments is included in the message…",
                        () =>
                        {
                            for (let argCount of [0, 1, 2, 3])
                            {
                                for (let typeArgCount of [0, 1, 2, 3])
                                {
                                    nameofCall.arguments = new Array(argCount);
                                    nameofCall.typeArguments = new Array(typeArgCount);
                                    ok(error.Message.includes(error.ArgumentCountText));
                                    ok(error.Message.includes(error.TypeArgumentCountText));
                                }
                            }
                        });
                });
        });
}
