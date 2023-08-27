import { ok, strictEqual } from "node:assert";
import { createSandbox, SinonSandbox, SinonStubbedInstance } from "sinon";
import { nameOf } from "ts-nameof-proxy";
import { IndexOutOfBoundsError } from "../../Diagnostics/IndexOutOfBoundsError.cjs";
import { NumericLiteralNode } from "../../Serialization/NumericLiteralNode.cjs";
import { Adapter } from "../../Transformation/Adapter.cjs";

/**
 * Registers tests for the {@linkcode IndexOutOfBoundsError} class.
 */
export function IndexOutOfBoundsErrorTests(): void
{
    suite(
        IndexOutOfBoundsError.name,
        () =>
        {
            let sandbox: SinonSandbox;
            let error: TestError;
            let adapter: SinonStubbedInstance<Adapter<any, any, any>>;
            let indexNode: NumericLiteralNode<any>;

            /**
             * Provides an implementation of {@linkcode IndexOutOfBoundsError} class for testing.
             */
            class TestError extends IndexOutOfBoundsError<any, any, any>
            {
                /**
                 * @inheritdoc
                 */
                public override get SegmentCount(): number
                {
                    return super.SegmentCount;
                }

                /**
                 * @inheritdoc
                 */
                public override get IndexNode(): NumericLiteralNode<any>
                {
                    return super.IndexNode;
                }

                /**
                 * @inheritdoc
                 */
                public override get Index(): number
                {
                    return super.Index;
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
                    indexNode = new NumericLiteralNode({}, 0);
                    error = new TestError(adapter, indexNode, 0, {});
                });

            teardown(
                () =>
                {
                    sandbox.restore();
                });

            suite(
                nameOf<TestError>((error) => error.constructor),
                () =>
                {
                    test(
                        `Checking whether the \`${nameOf<TestError>((e) => e.IndexNode)}\` is stored properly…`,
                        () =>
                        {
                            strictEqual(new TestError(adapter, indexNode, 0, {}).IndexNode, indexNode);
                        });

                    test(
                        `Checking whether the resulting \`${nameOf<TestError>((e) => e.SegmentCount)}\` always has a positive value…`,
                        () =>
                        {
                            let count = 2;
                            strictEqual(new TestError(adapter, indexNode, count, {}).SegmentCount, count);
                            strictEqual(new TestError(adapter, indexNode, -count, {}).SegmentCount, count);
                        });
                });

            suite(
                nameOf<TestError>((error) => error.Index),
                () =>
                {
                    test(
                        `Checking whether the value of the underlying \`${nameOf<TestError>((e) => e.IndexNode)}\` is returned properly…`,
                        () =>
                        {
                            let value = 10;
                            sandbox.replaceGetter(indexNode, "Value", () => value);
                            strictEqual(error.Index, value);
                        });
                });

            suite(
                nameOf<TestError>((error) => error.Message),
                () =>
                {
                    test(
                        "Checking whether the expected amount and the actual amount is stated properly…",
                        () =>
                        {
                            let index = 5;
                            sandbox.replaceGetter(indexNode, "Value", () => index);

                            for (let value of [0, 1, 3])
                            {
                                let nonZero = value !== 0;
                                let error = new TestError(adapter, indexNode, value, {});
                                let expectationText = "Expected ";
                                let rangeText = `${expectationText}a value between`;
                                let expected: string;
                                strictEqual(error.Message.includes(rangeText), nonZero);

                                if (nonZero)
                                {
                                    expected = `${rangeText} ${-value} and ${value}`;
                                }
                                else
                                {
                                    expected = `${expectationText}0`;
                                }

                                ok(error.Message.includes(`${expected}, but got ${index}`));
                            }
                        });
                });
        });
}
