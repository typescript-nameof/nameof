import { transformerFactory } from "@typescript-nameof/tsc-transformer";
import * as ts from "typescript";
import { replaceInFiles, replaceInText } from "./text";

/**
 * The API of the module.
 */
type Api = {
    /**
     * Creates a transformer factory for replacing `nameof` calls.
     *
     * @param program
     * The program containing the files to transform.
     */
    (program: ts.Program): ts.TransformerFactory<ts.SourceFile>;

    /**
     * Transforms the files with the specified {@link fileNames `fileNames`}.
     *
     * @param fileNames
     * The names of the files to transform.
     */
    replaceInFiles(fileNames: readonly string[]): Promise<void[]>;

    /**
     * Transforms the file with the specified {@link fileName `fileName`} with the specified {@link fileText `fileText`}.
     *
     * @param fileName
     * The name of the file to transform.
     *
     * @param fileText
     * The contents of the file to transform.
     */
    replaceInText(fileName: string, fileText: string):
        {
            /**
             * The new content of the file.
             */
            fileText?: string;

            /**
             * A value indicating whether a transformation has been performed.
             */
            replaced: boolean;
        };
};

let transformerFactoryBuilder: ts.ProgramPattern = (program, config?, extras?) =>
{
    return transformerFactory;
};

const api: Api = transformerFactoryBuilder as Api;
api.replaceInFiles = replaceInFiles;
api.replaceInText = replaceInText;
// this is for ts-jest support... not ideal
(api as any).factory = () => transformerFactory;

export = api;
