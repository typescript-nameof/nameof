import { ok } from "assert";
import { createSandbox, SinonSandbox, SinonStubbedInstance } from "sinon";
import { nameOf } from "ts-nameof-proxy";
import { InvalidArgumentCountError } from "../../Diagnostics/InvalidArgumentCountError.cjs";
import { Adapter } from "../../index.cjs";
import { NameofCall } from "../../Serialization/NameofCall.cjs";

/**
 * Registers tests for the {@linkcode InvalidArgumentCountError} class.
 */
export function InvalidArgumentCountErrorTests(): void
{
    suite(
        InvalidArgumentCountError.name,
        () =>
        {
            /**
             * Provides an implementation of the {@linkcode InvalidArgumentCountError} class for testing.
             */
            class TestError extends InvalidArgumentCountError<any, any, any>
            {
                /**
                 * @inheritdoc
                 */
                public override get Message(): string
                {
                    return super.Message;
                }

                /**
                 * @inheritdoc
                 */
                public override get FunctionName(): string
                {
                    return super.FunctionName;
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
                    error = new TestError(adapter, nameofCall, 0, {});
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
                        "Checking whether the message states the expected number of arguments…",
                        () =>
                        {
                            let expected = 2;
                            ok(new TestError(adapter, nameofCall, expected, {}).Message.includes(`Expected ${expected}`));
                        });

                    test(
                        "Checking whether the name of the called function is included in the message…",
                        () =>
                        {
                            nameofCall.function = undefined;
                            ok(error.Message.includes(`\`${error.FunctionName}\``));
                            nameofCall.function = "full";
                            ok(error.Message.includes(`\`${error.FunctionName}\``));
                        });

                    test(
                        "Checking whether the actual number of arguments is stated properly…",
                        () =>
                        {
                            for (let count of [0, 1, 2, 3])
                            {
                                let args = new Array(count);
                                nameofCall.arguments = args;
                                ok(error.Message.includes(`but got ${args.length}`));
                            }
                        });
                });
        });
}
