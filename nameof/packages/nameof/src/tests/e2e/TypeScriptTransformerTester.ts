import { ok } from "node:assert";
import { resolve } from "node:path";
import { IErrorHandler } from "@typescript-nameof/common";
import { INameofOutput, TransformerTester } from "@typescript-nameof/test";
import type { CompilerHost, Node } from "typescript";
import { CompilerResult } from "./CompilerResult.js";
import { ITypeScriptContext } from "../../Transformation/ITypeScriptContext.cjs";
import { TypeScriptTransformer } from "../../Transformation/TypeScriptTransformer.cjs";

/**
 * Provides the functionality to test typescript transformers.
 */
export abstract class TypeScriptTransformerTester extends TransformerTester<Node, ITypeScriptContext>
{
    /**
     * Gets a value indicating whether to use the integrated plugin system.
     */
    protected get UsePlugin(): boolean
    {
        return true;
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
    protected async Run(code: string, errorHandler?: IErrorHandler<Node, ITypeScriptContext>): Promise<string>
    {
        let result = await this.RunTransformer(code, errorHandler);

        if (result.diagnostics)
        {
            for (let diagnostic of result.diagnostics)
            {
                if (diagnostic.source === "typescript-nameof")
                {
                    errorHandler?.Report(
                        {},
                        undefined as any,
                        undefined as any,
                        new Error(`${diagnostic.messageText}`));
                }
            }
        }

        return result.code;
    }

    /**
     * Gets the compiler to use.
     */
    protected abstract GetCompiler(): Promise<typeof import("typescript")>;

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
    protected async RunTransformer(code: string, errorHandler?: IErrorHandler<Node, ITypeScriptContext> | undefined): Promise<CompilerResult>
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
        const tsLibrary = await this.GetCompiler();
        const { convertCompilerOptionsFromJson, createProgram, createSourceFile, getDefaultLibFileName, ScriptKind } = tsLibrary;

        let host: CompilerHost = {
            fileExists: (path) => path === fileName,
            readFile: (path) => path === fileName ? code : undefined,
            getSourceFile: (path, languageVersion) =>
            {
                if (path === fileName)
                {
                    return createSourceFile(fileName, code, languageVersion, false, ScriptKind.TS);
                }
                else
                {
                    return undefined;
                }
            },
            getDefaultLibFileName: (options) => getDefaultLibFileName(options),
            writeFile: () => { throw new Error("Not implemented"); },
            getCurrentDirectory: () => "/",
            getDirectories: () => [],
            getCanonicalFileName: (fileName) => fileName,
            useCaseSensitiveFileNames: () => true,
            getNewLine: () => "\n"
        };

        let config = convertCompilerOptionsFromJson(
            {
                strictNullChecks: true,
                target: "ES2022",
                ...(
                    this.UsePlugin ?
                        {
                            plugins: [
                                {
                                    transform: resolve(import.meta.dirname, "../../../")
                                }
                            ]
                        } :
                        {})
            },
            "/");

        let program = createProgram(
            [fileName],
            config.options,
            host);

        try
        {
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
                this.UsePlugin ?
                    {} :
                    {
                        before: [
                            new TypeScriptTransformer({ tsLibrary }, errorHandler).Factory
                        ]
                    });

            return {
                diagnostics: [...result.diagnostics],
                code: files[0].content
            };
        }
        catch (error)
        {
            console.log(error);
            throw error;
        }
    }

    /**
     * @inheritdoc
     *
     * @param input
     * The input of the transformation.
     *
     * @param result
     * The output of the transformation.
     *
     * @param errorClasses
     * The expected errors.
     */
    protected override async HasError(input: string, result: INameofOutput, ...errorClasses: Array<(new (...args: any[]) => Error)>): Promise<void>
    {
        if (this.UsePlugin)
        {
            ok(result.errors.length > 0);
        }
        else
        {
            await super.HasError(input, result, ...errorClasses);
        }
    }
}
