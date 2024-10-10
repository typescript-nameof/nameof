import { ok, strictEqual } from "node:assert";
import { TestErrorHandler } from "@typescript-nameof/test";
import { createSandbox, match, SinonSandbox, SinonStubbedInstance } from "sinon";
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
        public override get NameofName(): string
        {
            return super.NameofName;
        }

        /**
         * @inheritdoc
         */
        public override get SourceCode(): string
        {
            return super.SourceCode;
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
        protected override get Message(): string
        {
            return message;
        }

        /**
         * @inheritdoc
         */
        public override Report(): void
        {
            super.Report();
        }
    }

    suite(
        AdapterError.name,
        () =>
        {
            let sandbox: SinonSandbox;
            let adapter: SinonStubbedInstance<Adapter<any, any, any>>;
            let node: any;
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

                    adapter = sandbox.createStubInstance(Adapter);

                    adapter.ReportError.callsFake(
                        (item, context, error) =>
                        {
                            errorHandler.Report({}, item, context, error);
                        });

                    adapter.GetSourceCode = sandbox.stub();
                    adapter.GetNameofName.returns("");
                    adapter.GetSourceCode.returns("");

                    error = new TestAdapterError(adapter, node, undefined);
                });

            teardown(
                () =>
                {
                    sandbox.restore();
                });

            /**
             * Checks whether an error with the specified {@linkcode message} has been reported.
             *
             * @returns
             * A value indicating whether an error with the specified {@linkcode message} has been reported.
             */
            function wasReported(): boolean
            {
                return errorHandler.Errors.some((error) => error.message === message);
            }

            suite(
                nameOf<TestAdapterError>((error) => error.ReportAction),
                () =>
                {
                    test(
                        "Checking whether the exposed action reports the error…",
                        () =>
                        {
                            ok(!wasReported());
                            error.ReportAction();
                            ok(wasReported());
                        });
                });

            suite(
                nameOf<TestAdapterError>((error) => error.NameofName),
                () =>
                {
                    test(
                        "Checking whether the `nameof` name is determined using the adapter…",
                        () =>
                        {
                            ok(!adapter.GetNameofName.called);
                            error.NameofName.toString();
                            ok(adapter.GetNameofName.calledOnce);
                        });
                });

            suite(
                nameOf<TestAdapterError>((error) => error.SourceCode),
                () =>
                {
                    test(
                        "Checking whether the source code is determined using the adapter…",
                        () =>
                        {
                            let stub = adapter.GetSourceCode.withArgs(node, match.any);
                            stub.returns("Test");
                            ok(!adapter.GetSourceCode.called);
                            error.SourceCode.toString();
                            ok(adapter.GetSourceCode.calledOnce);
                            ok(stub.calledOnce);
                        });
                });

            suite(
                nameOf<TestAdapterError>((error) => error.EscapedCode),
                () =>
                {
                    test(
                        "Checking whether the source code is escaped properly…",
                        () =>
                        {
                            for (let symbol of ["`", "\\"])
                            {
                                adapter.GetSourceCode.returns(symbol);
                                strictEqual(error.EscapedCode, `\\${symbol}`);
                            }
                        });
                });

            suite(
                nameOf<TestAdapterError>((error) => error.Report),
                () =>
                {
                    test(
                        "Checking whether the error is reported…",
                        () =>
                        {
                            ok(!wasReported());
                            error.Report();
                            ok(wasReported());
                        });
                });
        });
}
