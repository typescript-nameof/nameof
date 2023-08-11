import { join } from "path";
import babel = require("@babel/core");
import { ITransformTarget } from "@typescript-nameof/babel-plugin";
import { IErrorHandler } from "@typescript-nameof/common";
import { TransformerTester } from "@typescript-nameof/tests-common";
import macroPlugin from "babel-plugin-macros";

/**
 * Provides the functionality to test the babel macro.
 */
export class BabelMacroTester extends TransformerTester<ITransformTarget>
{
    /**
     * The name of the component to import.
     */
    private componentName: string | undefined;

    /**
     * @inheritdoc
     */
    public RegisterCommon(): void
    {
        afterEach(
            () =>
            {
                this.componentName = undefined;
            });

        describe(
            "using a name other than nameof",
            () =>
            {
                beforeEach(
                    () =>
                    {
                        this.componentName = "other";
                    });

                it(
                    "should work when using a different import name",
                    () =>
                    {
                        this.Assert("other(console.log);other.full(console.log);", '"log";"console.log";');
                    });
            });

        super.RegisterCommon();
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
    protected async Run(code: string, errorHandler?: IErrorHandler<ITransformTarget> | undefined): Promise<string>
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
                            macroPlugin
                        ],
                        filename: join(__dirname, "test.ts"),
                        ast: false,
                        generatorOpts: {
                            retainLines: true
                        }
                    }))?.code;
        }
        catch (exception)
        {
            if (exception instanceof Error)
            {
                errorHandler?.Report(undefined as any, exception);
            }
        }

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
    protected async Preprocess(code: string): Promise<string>
    {
        return `import ${this.componentName ?? "nameof"} from './ts-nameof.macro';\n${code}`;
    }
}
