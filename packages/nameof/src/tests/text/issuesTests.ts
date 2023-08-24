import * as assert from "assert";
import { TempFile } from "@manuth/temp-files";
import fs from "fs-extra";
import { getTestFilePath } from "./helpers/index.js";
import { replaceInFiles } from "../../text/index.cjs";

const { copy, readFile } = fs;

/**
 * Registers tests related to issues.
 */
export function IssueTests(): void
{
    suite(
        "issue tests",
        () =>
        {
            suite(
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
                        let file = new TempFile();
                        fileName = getTestFilePath(fileName);
                        expectedFileName = getTestFilePath(expectedFileName);

                        await copy(fileName, file.FullName);
                        await replaceInFiles([file.FullName]);
                        const data = (await readFile(file.FullName)).toString();
                        const expectedContents = (await readFile(expectedFileName)).toString();
                        assert.equal(data.replace(/\r?\n/g, "\n"), expectedContents.replace(/\r?\n/g, "\n"));
                    }

                    /**
                     * Runs a test related to the issue with the specified {@link issueNumber `issueNumber`}.
                     *
                     * @param issueNumber
                     * The number of the issue to run tests for.
                     */
                    function runIssueTest(issueNumber: number): void
                    {
                        suite(
                            `issue ${issueNumber}`,
                            () =>
                            {
                                test(
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
        });
}
