import { ok, strictEqual } from "node:assert";
import { IAdapter } from "@typescript-nameof/common";
import { nameOf } from "ts-nameof-proxy";
import ts from "typescript";
import { ITypeScriptContext } from "../../Transformation/ITypeScriptContext.cjs";
import { TypeScriptFeatures } from "../../Transformation/TypeScriptFeatures.cjs";
import { TypeScriptTransformerBase } from "../../Transformation/TypeScriptTransformerBase.cjs";

/**
 * Registers tests for the {@linkcode TypeScriptTransformerBase} class.
 */
export function TypeScriptTransformerBaseTests(): void
{
    suite(
        TypeScriptTransformerBase.name,
        () =>
        {
            /**
             * Provides an implementation of the {@linkcode TypeScriptTransformerBase} class for testing.
             */
            class TestTransformer extends TypeScriptTransformerBase<TypeScriptFeatures>
            {
                /**
                 * @inheritdoc
                 */
                public override get Adapter(): IAdapter<ts.Node, ts.Node, ITypeScriptContext>
                {
                    return super.Adapter;
                }
            }

            let transformer: TestTransformer;
            let printer: ts.Printer;

            setup(
                () =>
                {
                    transformer = new TestTransformer(new TypeScriptFeatures());
                    printer = ts.createPrinter();
                });

            suite(
                nameOf<TestTransformer>((transformer) => transformer.Factory),
                () =>
                {
                    test(
                        "Checking whether source files can be transformer…",
                        () =>
                        {
                            let file = ts.createSourceFile("/file.ts", "nameof(console)", ts.ScriptTarget.ES2022);
                            file = ts.transform(file, [transformer.Factory]).transformed[0];
                            strictEqual(printer.printFile(file).trim(), '"console";');
                        });
                });

            suite(
                nameOf<TestTransformer>((transformer) => transformer.GetFactory),
                () =>
                {
                    test(
                        "Checking whether a custom post processor for transformations can be specified…",
                        () =>
                        {
                            let map: Map<ts.Node, ts.Node> = new Map();

                            let file = ts.createSourceFile(
                                "/file.ts",
                                "nameof(console); console.log(nameof(process)); nameof.full(console.log);",
                                ts.ScriptTarget.ES2022);

                            file = ts.transform(
                                file,
                                [
                                    transformer.GetFactory(
                                        {
                                            postTransformHook:
                                                (oldNode, newNode) =>
                                                {
                                                    if (oldNode !== newNode)
                                                    {
                                                        map.set(newNode, oldNode);
                                                    }
                                                }
                                        })
                                ]).transformed[0];

                            /**
                             * Checks whether all transformations are in the map.
                             *
                             * @param node
                             * The node to check.
                             */
                            function checkNodes(node: ts.Node): void
                            {
                                if (transformer.Adapter.IsMutated(node, { file }))
                                {
                                    ok(map.has(node));
                                    map.delete(node);
                                }
                                else
                                {
                                    node.forEachChild((node) => checkNodes(node));
                                }
                            }

                            checkNodes(file);
                            strictEqual(map.size, 0);
                        });
                });
        });
}
