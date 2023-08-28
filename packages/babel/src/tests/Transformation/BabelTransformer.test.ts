import { strictEqual } from "node:assert";
import babel from "@babel/core";
import generator from "@babel/generator";
import parser from "@babel/parser";
import { nameOf } from "ts-nameof-proxy";
import { BabelTransformer } from "../../Transformation/BabelTransformer.cjs";

/**
 * Registers tests for the {@linkcode BabelTransformer} class.
 */
export function BabelTransformerTests(): void
{
    suite(
        BabelTransformer.name,
        () =>
        {
            let transformer: BabelTransformer;
            let input: string;
            let expected: string;

            setup(
                () =>
                {
                    transformer = new BabelTransformer(babel);
                    input = "nameof(console);";
                    expected = '"console";';
                });

            suite(
                nameOf<BabelTransformer>((transformer) => transformer.Plugin),
                () =>
                {
                    test(
                        "Checking whether the plugin is able to transform nameof calls…",
                        () =>
                        {
                            let ast = parser.parse(input);
                            babel.traverse(ast, transformer.Plugin.visitor as any);
                            strictEqual(generator.default(ast).code, expected);
                        });
                });

            suite(
                nameOf<BabelTransformer>((transformer) => transformer.TransformNode),
                () =>
                {
                    test(
                        "Checking whether individual nodes can be transformed…",
                        () =>
                        {
                            let ast = parser.parse(input);

                            babel.traverse(
                                ast,
                                {
                                    CallExpression: (path) =>
                                    {
                                        transformer.TransformNode(path, { state: path.state });
                                    }
                                });

                            strictEqual(generator.default(ast).code, expected);
                        });
                });
        });
}
