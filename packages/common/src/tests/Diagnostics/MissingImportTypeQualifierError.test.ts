import { ok } from "node:assert";
import { createSandbox, SinonSandbox, SinonStubbedInstance } from "sinon";
import { nameOf } from "ts-nameof-proxy";
import { MissingImportTypeQualifierError } from "../../Diagnostics/MissingImportTypeQualifierError.cjs";
import { Adapter } from "../../Transformation/Adapter.cjs";

/**
 * Registers tests for the {@linkcode MissingImportTypeQualifierError} class.
 */
export function MissingImportTypeQualifierErrorTests(): void
{
    suite(
        MissingImportTypeQualifierError.name,
        () =>
        {
            /**
             * Provides an implementation of the {@linkcode MissingImportTypeQualifierError} class for testing.
             */
            class TestError extends MissingImportTypeQualifierError<any, any, any>
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
            let adapter: SinonStubbedInstance<Adapter<any, any, any>>;
            let importNode: any;
            let code: string;
            let error: TestError;

            suiteSetup(
                () =>
                {
                    sandbox = createSandbox();
                });

            setup(
                () =>
                {
                    importNode = {};
                    code = 'import("typescript")';
                    adapter = sandbox.createStubInstance(Adapter);
                    adapter.GetSourceCode = sandbox.stub();
                    adapter.GetSourceCode.returns(code);
                    error = new TestError(adapter, importNode, {});
                });

            suite(
                nameOf<TestError>((error) => error.Message),
                () =>
                {
                    test(
                        "Checking whether the escaped source code of the specified node is returned…",
                        () =>
                        {
                            ok(error.Message.includes(error.EscapedCode));
                        });
                });
        });
}
