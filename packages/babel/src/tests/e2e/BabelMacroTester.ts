import { fileURLToPath } from "node:url";
import babel from "@babel/core";
import { IErrorHandler } from "@typescript-nameof/common";
import { TransformerTester } from "@typescript-nameof/test";
import babelPluginMacros from "babel-plugin-macros";

/**
 * Provides the functionality to test the babel macro.
 */
export class BabelMacroTester extends TransformerTester<undefined>
{
    /**
     * The name of the component to import.
     */
    private componentName: string | undefined;

    /**
     * @inheritdoc
     */
    protected override get Title(): string
    {
        return "macro";
    }

    /**
     * @inheritdoc
     */
    public override RegisterTests(): void
    {
        setup(
            () =>
            {
                this.componentName = undefined;
            });

        suite(
            "Features",
            () =>
            {
                setup(
                    () =>
                    {
                        this.componentName = "myCustomNameof";
                    });

                test(
                    "Checking whether custom `nameof` names are respected…",
                    async () =>
                    {
                        await this.Assert(
                            "myCustomNameof(console.log);myCustomNameof.full(console.log);",
                            '"log";"console.log";');
                    });
            });

        suite(
            "General",
            () =>
            {
                super.RegisterTests();
            });
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
    protected async Run(code: string, errorHandler?: IErrorHandler<undefined> | undefined): Promise<string>
    {
        let result: string | undefined | null;

        try
        {
            result = (
                await babel.transformAsync(
                    code,
                    {
                        presets: [
                            "@babel/preset-typescript"
                        ],
                        plugins: [
                            [
                                babelPluginMacros,
                                {
                                    nameof: {
                                        errorHandler
                                    }
                                }
                            ]
                        ],
                        filename: fileURLToPath(new URL("test.ts", import.meta.url)),
                        ast: false,
                        generatorOpts: {
                            retainLines: true
                        }
                    }))?.code;
        }
        catch
        { }

        return result ?? "";
    }

    /**
     * @inheritdoc
     *
     * @param code
     * The code to pre-process.
     *
     * @returns
     * The pre-processed code.
     */
    protected override async Preprocess(code: string): Promise<string>
    {
        return `import ${this.componentName ?? "nameof"} from '../../../macro';${code}`;
    }
}
