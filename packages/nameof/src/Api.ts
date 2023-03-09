import { Program, SourceFile, TransformerFactory } from "typescript";

/**
 * Provides the functionality to transform `nameof` calls in TypeScript files.
 */
export type Api = TransformerFactory<SourceFile> & {
    /**
     * Creates a transformer factory for replacing `nameof` calls.
     *
     * @param program
     * The program containing the files to transform.
     */
    (program: Program): TransformerFactory<SourceFile>;

    /**
     * Creates an transformer factory for the use with `ts-jest`.
     *
     * @param compiler
     * The compiler used by `ts-jest`.
     *
     * @returns
     * A transformer factory for the use with `ts-jest`.
     */
    factory(compiler: any): TransformerFactory<SourceFile>;

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
