import { ok, strictEqual } from "assert";
import { TestErrorHandler } from "@typescript-nameof/tests-common";
import { createSandbox, SinonSandbox, SinonStubbedInstance } from "sinon";
import { nameOf } from "ts-nameof-proxy";
import { State } from "./State.js";
import { NodeKind } from "../../Serialization/NodeKind.cjs";
import { ErrorHandler } from "../../Transformation/ErrorHandler.cjs";
import { IErrorHandler } from "../../Transformation/IErrorHandler.cjs";
import { INodeLocation } from "../../Transformation/INodeLocation.cjs";
import { ITransformationContext } from "../../Transformation/ITransformationContext.cjs";
import { TransformerFeatures } from "../../Transformation/TransformerFeatures.cjs";

/**
 * Registers tests for the {@linkcode TransformerFeatures} class.
 */
export function TransformerFeaturesTests(): void
{
    suite(
        TransformerFeatures.name,
        () =>
        {
            /**
             * Provides an implementation of the {@linkcode TransformerFeatures} class for testing.
             */
            class TestTransformerFeatures extends TransformerFeatures<State, ITransformationContext<State>>
            {
                /**
                 * @inheritdoc
                 */
                public override get ErrorHandler(): IErrorHandler<State, ITransformationContext<State>> | undefined
                {
                    return super.ErrorHandler;
                }

                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The newly created error handler.
                 */
                public override InitializeErrorHandler(): IErrorHandler<State, ITransformationContext<State>>
                {
                    return super.InitializeErrorHandler();
                }
            }

            let sandbox: SinonSandbox;
            let features: SinonStubbedInstance<TestTransformerFeatures>;

            suiteSetup(
                () =>
                {
                    sandbox = createSandbox();
                });

            setup(
                () =>
                {
                    features = new TestTransformerFeatures() as SinonStubbedInstance<TestTransformerFeatures>;
                    sandbox.stub(features, "InitializeErrorHandler").callThrough();
                });

            teardown(
                () =>
                {
                    sandbox.restore();
                });

            suite(
                nameOf<TestTransformerFeatures>((features) => features.ErrorHandler),
                () =>
                {
                    test(
                        "Checking whether custom error handlers are respected…",
                        () =>
                        {
                            let errorHandler = new TestErrorHandler();
                            features = new TransformerFeatures(errorHandler) as any;
                            strictEqual(features.ErrorHandler, errorHandler);
                            ok(!features.InitializeErrorHandler.called);
                        });

                    test(
                        `Checking whether error handlers are initialized using the \`${nameOf<TestTransformerFeatures>((f) => f.InitializeErrorHandler)}\` method…`,
                        () =>
                        {
                            let errorHandler = new TestErrorHandler();
                            features.InitializeErrorHandler.callsFake(() => errorHandler);
                            strictEqual(features.ErrorHandler, errorHandler);
                            ok(features.InitializeErrorHandler.calledOnce);
                        });
                });

            suite(
                nameOf<TestTransformerFeatures>((features) => features.ReportError),
                () =>
                {
                    test(
                        "Checking whether the errors are forwarded to the error handler…",
                        () =>
                        {
                            let location: INodeLocation = {};

                            let node: State = {
                                type: NodeKind.IdentifierNode,
                                name: "process"
                            };

                            let context: ITransformationContext<State> = {};
                            let error = new Error("You're fired!");
                            let errorHandler = sandbox.createStubInstance(ErrorHandler);
                            features.InitializeErrorHandler.callsFake(() => errorHandler);
                            features.ReportError(location, node, context, error);
                            ok(errorHandler.Report.calledWith(location, node, context, error));
                        });
                });
        });
}
