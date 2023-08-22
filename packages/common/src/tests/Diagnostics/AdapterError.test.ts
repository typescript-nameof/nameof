import { strictEqual } from "assert";
import { nameOf } from "ts-nameof-proxy";
import { AdapterError } from "../../Diagnostics/AdapterError.cjs";

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
            suite(
                nameOf<TestAdapterError>((e) => e.ReportAction),
                () =>
                {
                    test(
                        "Example…",
                        () =>
                        {
                            strictEqual(1, 1);
                        });
                });
        });
}
