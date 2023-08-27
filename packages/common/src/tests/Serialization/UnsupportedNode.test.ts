import { strictEqual } from "node:assert";
import { createSandbox, SinonSandbox } from "sinon";
import { nameOf } from "ts-nameof-proxy";
import { CustomError } from "../../Diagnostics/CustomError.cjs";
import { PathKind } from "../../Serialization/PathKind.cjs";
import { UnsupportedNode } from "../../Serialization/UnsupportedNode.cjs";
import { Adapter } from "../../Transformation/Adapter.cjs";

/**
 * Registers tests for the {@linkcode UnsupportedNode} class.
 */
export function UnsupportedNodeTests(): void
{
    suite(
        UnsupportedNode.name,
        () =>
        {
            let sandbox: SinonSandbox;
            let adapter: Adapter<any, any, any>;
            let node: UnsupportedNode<any>;

            suiteSetup(
                () =>
                {
                    sandbox = createSandbox();
                });

            setup(
                () =>
                {
                    adapter = sandbox.createStubInstance(Adapter);
                    node = new UnsupportedNode({});
                });

            teardown(
                () =>
                {
                    sandbox.restore();
                });

            suite(
                nameOf<UnsupportedNode<any>>((node) => node.PathPart),
                () =>
                {
                    test(
                        "Checking whether the path part indicates an unsupported node…",
                        () =>
                        {
                            let part = node.PathPart;
                            strictEqual(part.type, PathKind.Unsupported);
                            strictEqual(part.source, node.Source);
                        });

                    test(
                        "Checking whether custom reasons for non-support can be specified…",
                        () =>
                        {
                            for (let reason of [undefined, new CustomError(adapter, {}, {}, "This is a test.")])
                            {
                                node = new UnsupportedNode({}, reason);
                                let part = node.PathPart;
                                strictEqual(part.type, PathKind.Unsupported);
                                strictEqual(part.reason, reason);
                            }
                        });
                });
        });
}
