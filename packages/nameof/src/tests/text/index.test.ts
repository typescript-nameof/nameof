import { basename, join } from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import { IssueTests } from "./issuesTests.js";
import { ReplaceInFilesTests } from "./replaceInFilesTests.js";

const { copy, emptyDir } = fs;

/**
 * Registers tests for text components.
 */
export function TextTests(): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            suiteSetup(
                async () =>
                {
                    let projectRoot = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..", "..");
                    let sourceRoot = join(projectRoot, "src", "tests", "testFiles");
                    let targetRoot = join(projectRoot, "temp", "testFiles");
                    await emptyDir(targetRoot);
                    await copy(sourceRoot, targetRoot);
                });

            IssueTests();
            ReplaceInFilesTests();
        });
}
