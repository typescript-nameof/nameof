import { ok } from "node:assert";
import { createSandbox, SinonSandbox, SinonStubbedInstance } from "sinon";
import { nameOf } from "ts-nameof-proxy";
import { InvalidDefaultCallError } from "../../Diagnostics/InvalidDefaultCallError.cjs";
import { NameofCall } from "../../Serialization/NameofCall.cjs";
import { Adapter } from "../../Transformation/Adapter.cjs";

/**
 * Registers tests for the {@linkcode InvalidArgumentCountError}.
 */
export function InvalidDefaultCallErrorTests(): void
{
    suite(
        InvalidDefaultCallError.name,
        () =>
        {
            /**
             * Provides an implementation of the {@linkcode InvalidDefaultCallError} class for testing.
             */
            class TestError extends InvalidDefaultCallError<any, any, any>
            {
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

                    nameofCall = {
                        source: {},
                        arguments: [],
                        typeArguments: []
                    };

                    adapter = sandbox.createStubInstance(Adapter);
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
                        "Checking whether the actual number of arguments and type arguments is stated properly…",
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
