import { ok } from "node:assert";
import { createSandbox, SinonSandbox, SinonStubbedInstance } from "sinon";
import { nameOf } from "ts-nameof-proxy";
import { NestedNameofError } from "../../Diagnostics/NestedNameofError.cjs";
import { Adapter } from "../../Transformation/Adapter.cjs";

/**
 * Registers tests for the {@linkcode NestedNameofError} class.
 */
export function NestedNameofErrorTests(): void
{
    suite(
        NestedNameofError.name,
        () =>
        {
            /**
             * Provides an implementation of the {@linkcode NestedNameofError} class for testing.
             */
            class TestError extends NestedNameofError<any, any, any>
            {
                /**
                 * @inheritdoc
                 */
                public override get NameofName(): string
                {
                    return super.NameofName;
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
                    adapter.GetNameofName.returns("myCustomNameof");
                    error = new TestError(adapter, {}, {});
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
                        "Checking whether the name of the `nameof` function is stated properly…",
                        () =>
                        {
                            ok(error.Message.includes(`${error.NameofName}()`));
                        });
                });
        });
}
