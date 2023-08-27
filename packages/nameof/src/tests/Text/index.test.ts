import { basename } from "node:path";
import { ReplaceInFilesTests } from "./ReplaceInFiles.test.js";
import { ReplaceInTextTests } from "./ReplaceInText.test.js";

/**
 * Registers tests for purpose
 */
export function TextTests(): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            ReplaceInTextTests();
            ReplaceInFilesTests();
        });
}
