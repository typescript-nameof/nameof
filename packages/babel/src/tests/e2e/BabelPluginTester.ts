import { resolve } from "node:path";
import babel = require("@babel/core");
import { IErrorHandler } from "@typescript-nameof/common";
import { TransformerTester } from "@typescript-nameof/test";
import { BabelTransformer } from "../../Transformation/BabelTransformer.cjs";
import { IBabelContext } from "../../Transformation/IBabelContext.cjs";

/**
 * Provides the functionality to test the babel plugin.
 */
export class BabelPluginTester extends TransformerTester<babel.Node, IBabelContext>
{
    /**
     * @inheritdoc
     */
    protected override get Title(): string
    {
        return "plugin";
    }

    /**
     * @inheritdoc
     */
    public override RegisterTests(): void
    {
        suite(
            "General",
            () =>
            {
                let self = this;
                let timeout = this.Timeout;

                test(
                    "Checking whether the package can be used as a babel plugin…",
                    async function()
                    {
                        this.timeout(timeout);
                        this.slow(timeout / 2);
                        await self.RunBabel("!function(){}()", "module:@typescript-nameof/babel");
                    });
            });

        super.RegisterTests();
    }

    /**
     * @inheritdoc
     *
     * @param code
     * The code to transform.
     *
     * @param errorHandler
     * A component for reporting errors.
     *
     * @returns
     * The transformed representation of the specified {@linkcode code}.
     */
    protected async Run(code: string, errorHandler?: IErrorHandler<babel.Node, IBabelContext>): Promise<string>
    {
        let plugin = (babelAPI: typeof babel): babel.PluginObj =>
        {
            return new BabelTransformer(babelAPI, errorHandler).Plugin;
        };

        return this.RunBabel(code, plugin);
    }

    /**
     * Transforms the specified {@linkcode code} using babel.
     *
     * @param code
     * The code to transform.
     *
     * @param plugin
     * The plugin to use for the transformation.
     *
     * @returns
     * The transformed {@linkcode code}.
     */
    protected async RunBabel(code: string, plugin: babel.PluginItem): Promise<string>
    {
        return (
            await babel.transformAsync(
                code,
                {
                    presets: [
                        "@babel/preset-typescript"
                    ],
                    plugins: [
                        plugin
                    ],
                    filename: resolve(import.meta.dirname, "test.ts"),
                    ast: false,
                    generatorOpts: {
                        retainLines: true
                    }
                }))?.code ?? "";
    }
}
