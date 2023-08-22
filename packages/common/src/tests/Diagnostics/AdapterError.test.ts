import { ok } from "assert";
import { TestErrorHandler } from "@typescript-nameof/tests-common";
import { createSandbox, SinonSandbox } from "sinon";
import { nameOf } from "ts-nameof-proxy";
import { AdapterError } from "../../Diagnostics/AdapterError.cjs";
import { Adapter } from "../../Transformation/Adapter.cjs";

/**
 * Registers tests for the {@linkcode AdapterError} class.
 */
export function AdapterErrorTests(): void
{
    let message: string;

    /**
     * Provides an implementation of the {@linkcode AdapterError} class for testing.
     */
    class TestAdapterError extends AdapterError<any, any, any>
    {
        /**
         * @inheritdoc
         */
        protected override get Message(): string
        {
            return message;
        }
    }

    suite(
        AdapterError.name,
        () =>
        {
            let sandbox: SinonSandbox;
            let error: TestAdapterError;
            let errorHandler: TestErrorHandler<any, any>;

            suiteSetup(
                () =>
                {
                    sandbox = createSandbox();
                });

            setup(
                () =>
                {
                    message = "Custom error message for testing";
                    errorHandler = new TestErrorHandler();

                    let adapter = sandbox.createStubInstance(Adapter);

                    adapter.ReportError.callsFake(
                        (item, context, error) =>
                        {
                            errorHandler.Report({}, item, context, error);
                        });

                    error = new TestAdapterError(adapter, undefined, undefined);
                });

            teardown(
                () =>
                {
                    sandbox.restore();
                });

            suite(
                nameOf<TestAdapterError>((e) => e.ReportAction),
                () =>
                {
                    test(
                        "Checking whether the exposed action reports the error…",
                        () =>
                        {
                            ok(!errorHandler.Errors.includes(error));
                            error.ReportAction();
                            ok(errorHandler.Errors.some((error) => error.message === message));
                        });
                });
        });
}
