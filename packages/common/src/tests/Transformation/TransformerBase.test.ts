import { ok, strictEqual } from "assert";
import { TestErrorHandler } from "@typescript-nameof/test";
import { createSandbox, SinonSandbox, SinonStubbedInstance } from "sinon";
import { nameOf } from "ts-nameof-proxy";
import { State } from "./State.js";
import { TestAdapter } from "./TestAdapter.js";
import { UnusedInterpolationError } from "../../Diagnostics/UnusedInterpolationError.cjs";
import { NodeKind } from "../../Serialization/NodeKind.cjs";
import { IAdapter } from "../../Transformation/IAdapter.cjs";
import { ITransformationContext } from "../../Transformation/ITransformationContext.cjs";
import { TransformAction } from "../../Transformation/TransformAction.cjs";
import { TransformerBase } from "../../Transformation/TransformerBase.cjs";
import { TransformerFeatures } from "../../Transformation/TransformerFeatures.cjs";

/**
 * Registers tests for the {@linkcode TransformerBase} class.
 */
export function TransformerBaseTests(): void
{
    suite(
        TransformerBase.name,
        () =>
        {
            /**
             * Provides an implementation of the {@linkcode TransformerBase} class for testing.
             */
            class TestTransformer extends TransformerBase<State, State, ITransformationContext<State>, TransformerFeatures<State, ITransformationContext<State>>>
            {
                /**
                 * @inheritdoc
                 */
                public override get Adapter(): IAdapter<State, State, ITransformationContext<State>>
                {
                    return super.Adapter;
                }

                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The newly created adapter.
                 */
                public override InitializeAdapter(): IAdapter<State, State, ITransformationContext<State>>
                {
                    return new TestAdapter(this.Features);
                }

                /**
                 * @inheritdoc
                 *
                 * @param action
                 * The action to execute.
                 *
                 * @returns
                 * The result of the action.
                 */
                public override MonitorInterpolations<T>(action: TransformAction<State, T>): T
                {
                    return super.MonitorInterpolations(action);
                }
            }

            let sandbox: SinonSandbox;
            let transformer: SinonStubbedInstance<TestTransformer>;
            let errorHandler: TestErrorHandler<State, ITransformationContext<State>>;
            let node: State;

            suiteSetup(
                () =>
                {
                    sandbox = createSandbox();
                });

            setup(
                () =>
                {
                    errorHandler = new TestErrorHandler();
                    transformer = new TestTransformer(new TransformerFeatures(errorHandler)) as SinonStubbedInstance<TestTransformer>;
                    sandbox.stub(transformer, "InitializeAdapter");
                    transformer.InitializeAdapter.callThrough();

                    node = {
                        type: NodeKind.IdentifierNode,
                        name: "console"
                    };
                });

            teardown(
                () =>
                {
                    sandbox.restore();
                });

            suite(
                nameOf<TestTransformer>((transformer) => transformer.Adapter),
                () =>
                {
                    test(
                        `Checking whether the adapter is initialized using the \`${nameOf<TestTransformer>((t) => t.InitializeAdapter)}\` method…`,
                        () =>
                        {
                            let adapter: any = {};
                            transformer.InitializeAdapter.callsFake(() => adapter);
                            strictEqual(transformer.Adapter, adapter);
                            ok(transformer.InitializeAdapter.calledOnce);
                        });

                    test(
                        "Checking whether the adapter is only initialized once…",
                        () =>
                        {
                            transformer.InitializeAdapter.callThrough();
                            let adapter = transformer.Adapter;
                            strictEqual(transformer.Adapter, adapter);
                            strictEqual(transformer.Adapter, adapter);
                            ok(transformer.InitializeAdapter.calledOnce);
                        });
                });

            suite(
                nameOf<TestTransformer>((transformer) => transformer.MonitorInterpolations),
                () =>
                {
                    test(
                        "Checking whether the return value of the action is returned…",
                        () =>
                        {
                            let returnValue = "It's-a me!";
                            strictEqual(transformer.MonitorInterpolations(() => returnValue), returnValue);
                        });

                    test(
                        "Checking whether an error is thrown if an interpolation call is detected that is unaccounted for…",
                        () =>
                        {
                            transformer.MonitorInterpolations(
                                (context) =>
                                {
                                    context.interpolationCalls ??= [];
                                    context.interpolationCalls.push(node);
                                });

                            strictEqual(errorHandler.Errors.length, 1);
                            strictEqual(errorHandler.Errors[0].name, UnusedInterpolationError.name);
                        });
                });
        });
}
