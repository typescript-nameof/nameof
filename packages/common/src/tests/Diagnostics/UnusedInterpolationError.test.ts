import { ok } from "assert";
import { createSandbox, SinonSandbox, SinonStubbedInstance } from "sinon";
import { nameOf } from "ts-nameof-proxy";
import { UnusedInterpolationError } from "../../Diagnostics/UnusedInterpolationError.cjs";
import { NameofFunction } from "../../NameofFunction.cjs";
import { Adapter } from "../../Transformation/Adapter.cjs";

/**
 * Registers tests for the {@linkcode UnusedInterpolationError} class.
 */
export function UnusedInterpolationErrorTests(): void
{
    suite(
        UnusedInterpolationError.name,
        () =>
        {
            /**
             * Provides an implementation of the {@linkcode UnusedInterpolationError} class for testing.
             */
            class TestError extends UnusedInterpolationError<any, any, any>
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
                        "Checking whether the message includes the escaped code of the unused interpolation call…",
                        () =>
                        {
                            ok(error.Message.includes(error.EscapedCode));
                        });

                    test(
                        "Checking whether the proper `nameof` function name is stated in the message…",
                        () =>
                        {
                            adapter.GetNameofName.returns("myNameof");
                            ok(error.Message.includes(`${error.NameofName}.${NameofFunction.Full}`));
                        });
                });
        });
}
