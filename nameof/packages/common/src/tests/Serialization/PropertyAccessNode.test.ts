import { deepStrictEqual, strictEqual } from "node:assert";
import { nameOf } from "ts-nameof-proxy";
import { IdentifierNode } from "../../Serialization/IdentifierNode.cjs";
import { PathKind } from "../../Serialization/PathKind.cjs";
import { PropertyAccessNode } from "../../Serialization/PropertyAccessNode.cjs";

/**
 * Registers tests for the {@linkcode PropertyAccessNode} class.
 */
export function PropertyAccessNodeTests(): void
{
    suite(
        PropertyAccessNode.name,
        () =>
        {
            let root: IdentifierNode<any>;
            let innerAccessor: PropertyAccessNode<any>;
            let outerAccessor: PropertyAccessNode<any>;

            setup(
                () =>
                {
                    let innerMember = new IdentifierNode({}, "full");
                    let outerMember = new IdentifierNode({}, "bind");
                    root = new IdentifierNode({}, "nameof");
                    innerAccessor = new PropertyAccessNode({}, root, innerMember, innerMember.Name);
                    outerAccessor = new PropertyAccessNode({}, innerAccessor, outerMember, outerMember.Name);
                });

            suite(
                nameOf<PropertyAccessNode<any>>((node) => node.PathPart),
                () =>
                {
                    test(
                        "Checking whether the path part represents the property access node properly…",
                        () =>
                        {
                            let member = new IdentifierNode({}, "split");
                            let accessNode = new PropertyAccessNode({}, root, member, member.Name);
                            let part = accessNode.PathPart;
                            strictEqual(part.type, PathKind.PropertyAccess);
                            strictEqual(part.source, accessNode.Source);
                            strictEqual(part.value, accessNode.PropertyName);
                        });
                });

            suite(
                nameOf<PropertyAccessNode<any>>((node) => node.Path),
                () =>
                {
                    test(
                        "Checking whether the full path including the path of the underlying expression is returned…",
                        () =>
                        {
                            deepStrictEqual(innerAccessor.Path, [root.PathPart, innerAccessor.PathPart]);
                            deepStrictEqual(outerAccessor.Path, [root.PathPart, innerAccessor.PathPart, outerAccessor.PathPart]);
                        });
                });

            suite(
                nameOf<PropertyAccessNode<any>>((node) => node.Root),
                () =>
                {
                    test(
                        "Checking whether the root of the access path is returned…",
                        () =>
                        {
                            strictEqual(innerAccessor.Root, root);
                            strictEqual(outerAccessor.Root, root);
                        });
                });
        });
}
