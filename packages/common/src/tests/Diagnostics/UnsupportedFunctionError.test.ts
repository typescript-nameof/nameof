import { ok } from "node:assert";
import { createSandbox, SinonSandbox, SinonStubbedInstance } from "sinon";
import { nameOf } from "ts-nameof-proxy";
import { UnsupportedFunctionError } from "../../Diagnostics/UnsupportedFunctionError.cjs";
import { NameofCall } from "../../Serialization/NameofCall.cjs";
import { Adapter } from "../../Transformation/Adapter.cjs";

/**
 * Registers tests for the {@linkcode UnsupportedFunctionError} class.
 */
export function UnsupportedFunctionErrorTests(): void
{
    suite(
        UnsupportedFunctionError.name,
        () =>
        {
            /**
             * Provides an implementation of the {@linkcode UnsupportedFunctionError} class for testing.
             */
            class TestError extends UnsupportedFunctionError<any, any, any>
            {
                /**
                 * @inheritdoc
                 */
                public override get FunctionName(): string
                {
                    return super.FunctionName;
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
            let nameofCall: NameofCall<any>;
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

                    nameofCall = {
                        source: {},
                        arguments: [],
                        typeArguments: []
                    };

                    error = new TestError(adapter, nameofCall, {});
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
                        "Checking whether the invalid function name is stated in the message…",
                        () =>
                        {
                            for (let name of ["this", "is", "a", "test"])
                            {
                                nameofCall.function = name;
                                ok(error.Message.includes(error.FunctionName));
                            }
                        });
                });
        });
}
