import { ok } from "assert";
import { createSandbox, SinonSandbox, SinonStubbedInstance } from "sinon";
import { nameOf } from "ts-nameof-proxy";
import { UnsupportedScenarioError } from "../../Diagnostics/UnsupportedScenarioError.cjs";
import { Adapter } from "../../Transformation/Adapter.cjs";

/**
 * Registers tests for the {@linkcode UnsupportedScenarioError} class.
 */
export function UnsupportedScenarioErrorTests(): void
{
    suite(
        UnsupportedScenarioError.name,
        () =>
        {
            /**
             * Provides an implementation of the {@linkcode UnsupportedScenarioError} class for testing.
             */
            class TestError extends UnsupportedScenarioError<any, any, any>
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
                    adapter.GetSourceCode.returns("nameof.interpolate(i)");
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
                        "Checking whether the escaped code of the unsupported node is included in the message…",
                        () =>
                        {
                            ok(error.Message.includes(error.EscapedCode));
                        });
                });
        });
}
