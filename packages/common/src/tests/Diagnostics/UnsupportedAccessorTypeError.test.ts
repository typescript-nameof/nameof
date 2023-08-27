import { ok } from "node:assert";
import { createSandbox, SinonSandbox, SinonStubbedInstance } from "sinon";
import { nameOf } from "ts-nameof-proxy";
import { UnsupportedAccessorTypeError } from "../../Diagnostics/UnsupportedAccessorTypeError.cjs";
import { Adapter } from "../../Transformation/Adapter.cjs";

/**
 * Registers tests for the {@linkcode UnsupportedAccessorTypeError} class.
 */
export function UnsupportedAccessorTypeErrorTests(): void
{
    suite(
        UnsupportedAccessorTypeError.name,
        () =>
        {
            /**
             * Provides an implementation of the {@linkcode UnsupportedAccessorTypeError} class for testing.
             */
            class TestError extends UnsupportedAccessorTypeError<any, any, any>
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
                    adapter.GetSourceCode.returns("`${i}`");
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
                        "Checking whether the message contains the escaped code of the invalid node…",
                        () =>
                        {
                            ok(error.Message.includes(error.EscapedCode));
                        });
                });
        });
}
