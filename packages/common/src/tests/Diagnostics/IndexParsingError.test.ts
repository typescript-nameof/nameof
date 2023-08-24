import { ok } from "assert";
import { createSandbox, SinonSandbox, SinonStubbedInstance } from "sinon";
import { nameOf } from "ts-nameof-proxy";
import { IndexParsingError } from "../../Diagnostics/IndexParsingError.cjs";
import { Adapter } from "../../Transformation/Adapter.cjs";

/**
 * Registers tests for the
 */
export function IndexParsingErrorTests(): void
{
    suite(
        IndexParsingError.name,
        () =>
        {
            let sandbox: SinonSandbox;
            let error: TestError;
            let adapter: SinonStubbedInstance<Adapter<any, any, any>>;

            /**
             * Provides an implementation of the {@linkcode IndexParsingError} class for testing.
             */
            class TestError extends IndexParsingError<any, any, any>
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

            suiteSetup(
                () =>
                {
                    sandbox = createSandbox();
                });

            setup(
                () =>
                {
                    adapter = sandbox.createStubInstance(Adapter);
                    error = new TestError(adapter, {}, {});
                });

            suite(
                nameOf<TestError>((error) => error.Message),
                () =>
                {
                    test(
                        "Checking whether the message includes the escaped code of the node…",
                        () =>
                        {
                            adapter.GetSourceCode = sandbox.stub();
                            adapter.GetSourceCode.returns("Number.parseInt(`2`)");
                            ok(error.Message.includes(error.EscapedCode));
                        });
                });
        });
}
