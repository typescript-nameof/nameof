import { IErrorHandler } from "@typescript-nameof/common";
import { TestErrorHandler, TransformerTester } from "@typescript-nameof/test";
import { TsCompiler } from "ts-jest/dist/legacy/compiler/ts-compiler.js";
import { ConfigSet } from "ts-jest/dist/legacy/config/config-set.js";
import { TSJestErrorHandler } from "../../Diagnostics/TSJestErrorHandler.cjs";
import { TSJestFeatures } from "../../Transformation/TSJestFeatures.cjs";
import { TSJestTransformer } from "../../Transformation/TSJestTransformer.cjs";

/**
 * Provides the functionality to test the `ts-jest` integration using a transformer.
 */
export class TSJestTester extends TransformerTester<any, any>
{
    /**
     * @inheritdoc
     */
    protected override get Title(): string
    {
        return "ts-jest";
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
    protected override async Run(code: string, errorHandler?: IErrorHandler<any, any> | undefined): Promise<string>
    {
        let compiler = new TsCompiler(new ConfigSet(undefined), new Map());

        let transformer = new TSJestTransformer(
            compiler,
            undefined,
            new TestErrorHandler(
                errorHandler ?? new TestErrorHandler(),
                new TSJestErrorHandler(new TSJestFeatures(compiler))));

        let ts = compiler.configSet.compilerModule;

        let file = ts.createSourceFile(
            "/file.ts",
            code,
            ts.ScriptTarget.ES2022);

        try
        {
            let result = ts.transform(
                file,
                [transformer.Factory]);

            file = result.transformed[0];

            return ts.createPrinter().printFile(file);
        }
        catch
        {
            return "";
        }
    }
}
