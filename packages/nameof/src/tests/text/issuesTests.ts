import * as assert from "assert";
import { getTestFilePath, readFile, writeFile } from "./helpers";
import { replaceInFiles } from "../../text";

describe(
    "replaceInFiles()",
    () =>
    {
        /**
         * Runs a test on the file with the specified {@link fileName `fileName`}.
         *
         * @param fileName
         * The name of the file to test.
         *
         * @param expectedFileName
         * The name of the file which contains the expected results.
         */
        async function runTest(fileName: string, expectedFileName: string): Promise<void>
        {
            fileName = getTestFilePath(fileName);
            expectedFileName = getTestFilePath(expectedFileName);

            const originalFileText = await readFile(expectedFileName);

            try
            {
                try
                {
                    await replaceInFiles([fileName]);
                }
                catch (error)
                {
                    console.log(error);
                }

                const data = await readFile(fileName);
                const expectedContents = await readFile(expectedFileName);
                assert.equal(data.replace(/\r?\n/g, "\n"), expectedContents.replace(/\r?\n/g, "\n"));
            }
            finally
            {
                await writeFile(expectedFileName, originalFileText);
            }
        }

        /**
         * Runs a test related to the issue with the specified {@link issueNumber `issueNumber`}.
         *
         * @param issueNumber
         * The number of the issue to run tests for.
         */
        function runIssueTest(issueNumber: number): void
        {
            describe(
                `issue ${issueNumber}`,
                () =>
                {
                    it(
                        "should replace",
                        async () =>
                        {
                            await runTest(`issues/${issueNumber}-source.txt`, `issues/${issueNumber}-expected.txt`);
                        });
                });
        }

        runIssueTest(8);
        runIssueTest(11);
    });
