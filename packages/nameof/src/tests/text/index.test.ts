import { basename } from "path";
import { IssueTests } from "./issuesTests.js";
import { ReplaceInFilesTests } from "./replaceInFilesTests.js";

/**
 * Registers tests for text components.
 */
export function TextTests(): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            IssueTests();
            ReplaceInFilesTests();
        });
}
