import { resolve } from "path";
import babel = require("@babel/core");
import { IErrorHandler } from "@typescript-nameof/common";
import { TransformerTester } from "@typescript-nameof/tests-common";
import { BabelTransformer } from "../Transformation/BabelTransformer";

/**
 * Provides the functionality to test the babel plugin.
 */
export class BabelPluginTester extends TransformerTester<babel.Node>
{
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
    protected async Run(code: string, errorHandler?: IErrorHandler<babel.Node>): Promise<string>
    {
        let plugin = (babelAPI: typeof babel): babel.PluginObj =>
        {
            return new BabelTransformer(babelAPI, errorHandler).Plugin;
        };

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
                filename: resolve(__dirname, "test.ts"),
                ast: false,
                generatorOpts: {
                    retainLines: true
                }
            }))?.code ?? "";
    }
}
