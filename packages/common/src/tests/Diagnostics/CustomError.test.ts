import { strictEqual } from "assert";
import { createSandbox, SinonSandbox } from "sinon";
import { nameOf } from "ts-nameof-proxy";
import { CustomError } from "../../Diagnostics/CustomError.cjs";
import { Adapter } from "../../Transformation/Adapter.cjs";

/**
 * Registers tests for the
 */
export function CustomErrorTests(): void
{
    suite(
        CustomError.name,
        () =>
        {
            /**
             * Provides an implementation of the {@linkcode CustomError} class for testing.
             */
            class TestError extends CustomError<any, any, any>
            {
                /**
                 * @inheritdoc
                 */
                public override get Message(): string
                {
                    return super.Message;
                }
            }

            suite(
                nameOf<TestError>((error) => error.constructor),
                () =>
                {
                    let sandbox: SinonSandbox;
                    let adapter: Adapter<any, any, any>;

                    suiteSetup(
                        () =>
                        {
                            sandbox = createSandbox();
                        });

                    setup(
                        () =>
                        {
                            adapter = sandbox.createStubInstance(Adapter);
                        });

                    teardown(
                        () =>
                        {
                            sandbox.restore();
                        });

                    test(
                        "Checking whether a custom error message can be provided…",
                        () =>
                        {
                            let message = "This is a custom error message.";
                            strictEqual(new TestError(adapter, undefined, undefined, message).Message, message);
                        });
                });
        });
}
