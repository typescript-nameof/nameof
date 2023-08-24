import { ok } from "assert";
import { createSandbox, SinonSandbox, SinonStubbedInstance } from "sinon";
import { nameOf } from "ts-nameof-proxy";
import { UnsupportedNodeError } from "../../Diagnostics/UnsupportedNodeError.cjs";
import { Adapter } from "../../Transformation/Adapter.cjs";

/**
 * Registers tests for the {@linkcode UnsupportedNodeError} class.
 */
export function UnsupportedNodeErrorTests(): void
{
    suite(
        UnsupportedNodeError.name,
        () =>
        {
            /**
             * Provides an implementation of the {@linkcode UnsupportedNodeError} class for testing.
             */
            class TestError extends UnsupportedNodeError<any, any, any>
            {
                /**
                 * @inheritdoc
                 */
                public override get EscapedCode(): string
                {
                    return super.EscapedCode;
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
                    adapter.GetSourceCode ??= sandbox.stub();
                    adapter.GetSourceCode.returns("2 * 2");
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
                        "Checking whether the message includes the escaped code of the unsupported node…",
                        () =>
                        {
                            ok(error.Message.includes(error.EscapedCode));
                        });
                });
        });
}
