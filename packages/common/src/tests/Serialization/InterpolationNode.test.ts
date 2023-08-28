import { strictEqual } from "node:assert";
import { nameOf } from "ts-nameof-proxy";
import { InterpolationNode } from "../../Serialization/InterpolationNode.cjs";
import { PathKind } from "../../Serialization/PathKind.cjs";

/**
 * Registers tests for the {@linkcode InterpolationNode} class.
 */
export function InterpolationNodeTests(): void
{
    suite(
        InterpolationNode.name,
        () =>
        {
            suite(
                nameOf<InterpolationNode<any>>((node) => node.PathPart),
                () =>
                {
                    test(
                        "Checking whether the path part represents the interpolation properly…",
                        () =>
                        {
                            let node = new InterpolationNode({}, {});
                            let part = node.PathPart;
                            strictEqual(part.type, PathKind.Interpolation);
                            strictEqual(part.source, node.Source);
                            strictEqual(part.node, node.Expression);
                        });
                });
        });
}
