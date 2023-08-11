import { IErrorHandler } from "@typescript-nameof/common";
import { TransformerTester } from "@typescript-nameof/tests-common";
import ts = require("typescript");
import { TypeScriptTransformer } from "../TypeScriptTransformer";

/**
 * Provides the functionality to test typescript transformers.
 */
export class TypeScriptTester extends TransformerTester<ts.Node>
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
    protected async Run(code: string, errorHandler?: IErrorHandler<ts.Node> | undefined): Promise<string>
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
                    return undefined;
                }
                else
                {
                    ts.createSourceFile(fileName, code, languageVersion, false, ts.ScriptKind.TS);
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

        let program = ts.createProgram(
            [fileName],
            {
                strictNullChecks: true,
                target: ts.ScriptTarget.ES2017
            },
            host);

        program.emit(
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
            {
                before: [
                    new TypeScriptTransformer(errorHandler).Factory
                ]
            });

        return files[0].content;
    }
}
