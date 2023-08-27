import { resolve } from "path";
import { fileURLToPath } from "url";
import { IErrorHandler } from "@typescript-nameof/common";
import { INameofOutput, TestErrorHandler } from "@typescript-nameof/tests-common";
import ts = require("typescript");
import { CompilerResult } from "./CompilerResult.js";
import { TypeScriptTransformerTester } from "./TypeScriptTransformerTester.js";
import { ITypeScriptContext } from "../../Transformation/ITypeScriptContext.cjs";

/**
 * Provides the functionality to test typescript transformers.
 */
export class TSPatchTester extends TypeScriptTransformerTester
{
    /**
     * @inheritdoc
     */
    protected override get Title(): string
    {
        return "ts-patch";
    }

    /**
     * @inheritdoc
     */
    protected override get DefaultErrorHandler(): IErrorHandler<ts.Node, ITypeScriptContext>
    {
        return new TestErrorHandler();
    }

    /**
     * Runs the transformer.
     *
     * @param code
     * The code to transform.
     *
     * @param errorHandler
     * A component for reporting errors.
     *
     * @returns
     * The result of the transformation.
     */
    protected override async RunTransformer(code: string, errorHandler?: IErrorHandler<ts.Node, ITypeScriptContext>): Promise<CompilerResult>
    {
        /**
         * Represents an emitted file.
         */
        interface IFileInfo
        {
            /**
             * The name of the file.
             */
            fileName: string;

            /**
             * The contents of the file.
             */
            content: string;
        }

        let files: IFileInfo[] = [];
        let fileName = "/file.ts";

        let host: ts.CompilerHost = {
            fileExists: (path) => path === fileName,
            readFile: (path) => path === fileName ? code : undefined,
            getSourceFile: (path, languageVersion) =>
            {
                if (path === fileName)
                {
                    return ts.createSourceFile(fileName, code, languageVersion, false, ts.ScriptKind.TS);
                }
                else
                {
                    return undefined;
                }
            },
            getDefaultLibFileName: (options) => ts.getDefaultLibFileName(options),
            writeFile: () => { throw new Error("Not implemented"); },
            getCurrentDirectory: () => "/",
            getDirectories: () => [],
            getCanonicalFileName: (fileName) => fileName,
            useCaseSensitiveFileNames: () => true,
            getNewLine: () => "\n"
        };

        let configFile = ts.parseConfigFileTextToJson(
            "tsconfig.json",
            JSON.stringify(
                {
                    compilerOptions: {
                        strictNullChecks: true,
                        target: "ES2022",
                        plugins: [
                            {
                                transform: resolve(fileURLToPath(new URL(".", import.meta.url)), "../../../")
                            }
                        ]
                    }
                }));

        let program = ts.createProgram(
            [fileName],
            configFile.config.compilerOptions,
            host);

        let result = program.emit(
            undefined,
            (fileName, content) =>
            {
                files.push(
                    {
                        fileName,
                        content
                    });
            },
            undefined,
            false,
            {});

        return {
            diagnostics: [...result.diagnostics],
            code: files[0].content
        };
    }

    /**
     * @inheritdoc
     *
     * @param input
     * The input of the transformation.
     *
     * @param result
     * The output of the transformation.
     */
    protected override async HasError(input: string, result: INameofOutput): Promise<void>
    {
        super.HasError(input, result);
    }
}
