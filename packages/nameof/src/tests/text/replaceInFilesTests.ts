import { strictEqual } from "assert";
import { readFile, writeFile } from "fs-extra";
import { getTestFilePath } from "./helpers";
import { replaceInFiles } from "../../text";

describe(
    "replaceInFiles()",
    () =>
    {
        /**
         * Represents a file.
         */
        interface IFileInfo
        {
            /**
             * The name of the file.
             */
            filePath: string;

            /**
             * The contents of the file.
             */
            contents: string;
        }

        /**
         * Runs a test on the files located at the specified {@link paths `paths`}.
         *
         * @param paths
         * The names of the input files.
         *
         * @param expectedFiles
         * The name of the files which contain the expected results.
         */
        async function runTest(paths: string[], expectedFiles: IFileInfo[]): Promise<void>
        {
            paths = paths.map(p => getTestFilePath(p));
            expectedFiles.forEach(f => f.filePath = getTestFilePath(f.filePath));

            const initialFiles = await Promise.all(
                expectedFiles.map(
                    (file) =>
                    {
                        return (
                            async () =>
                            {
                                return {
                                    ...file,
                                    contents: await readFile(file.filePath)
                                };
                            })();
                    }));

            try
            {
                await replaceInFiles(paths);

                await Promise.allSettled(
                    expectedFiles.map(
                        (file) =>
                        {
                            return (
                                async () =>
                                {
                                    strictEqual(
                                        (await readFile(file.filePath)).toString().replace(/\r?\n/g, "\n"),
                                        file.contents.replace(/\r?\n/g, "\n"));
                                })();
                        }));
            }
            finally
            {
                await Promise.all(initialFiles.map(f => writeFile(f.filePath, f.contents)));
            }
        }

        describe(
            "glob support",
            () =>
            {
                it(
                    "should replace in MyGlobTestFile.txt",
                    async () =>
                    {
                        await runTest(
                            [
                                "globFolder/**/*.txt"
                            ],
                            [
                                {
                                    filePath: "globFolder/MyGlobTestFile.txt",
                                    contents: 'console.log("console");\n'
                                }
                            ]);
                    });
            });

        describe(
            "general file",
            () =>
            {
                it(
                    "should have the correct number of characters",
                    async () =>
                    {
                        // because an IDE might auto-format the code, this makes sure that hasn't happened
                        strictEqual(
                            (await readFile(getTestFilePath("GeneralTestFile.txt"))).toString().replace(/\r?\n/g, "\n").length,
                            1105);
                    });

                const expected = `console.log("alert");
console.log("alert");
console.log("window.alert");
console.log("window.alert");
console.log("window.alert.length");
console.log("alert.length");
console.log("length");
console.log("window.alert.length");
console.log("alert.length");
console.log("length");
console.log( "window" );
console.log(  "window" );
console.log("clearTimeout");
console.log("Array");
console.log("Array");
console.log("prop");
console.log("prop");
console.log("prop");
console.log("MyNamespace.MyInnerInterface");
console.log("MyNamespace.MyInnerInterface");
console.log("MyInnerInterface");
console.log("MyNamespace.MyInnerInterface");
console.log("MyInnerInterface");
`;

                describe(
                    "file modifying test",
                    () =>
                    {
                        it(
                            "should modify the file",
                            async () =>
                            {
                                await runTest(
                                    [
                                        "GeneralTestFile.txt"
                                    ],
                                    [
                                        {
                                            filePath: "GeneralTestFile.txt",
                                            contents: expected
                                        }
                                    ]);
                            });
                    });
            });
    });
