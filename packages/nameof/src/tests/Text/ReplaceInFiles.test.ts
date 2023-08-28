import { strictEqual } from "node:assert";
import { TempDirectory } from "@manuth/temp-files";
import fs from "fs-extra";
import { replaceInFiles } from "../../text/replaceInFiles.cjs";

const { emptyDir, ensureFile, readFile, writeFile } = fs;

/**
 * Registers tests for the {@linkcode replaceInFiles} function.
 */
export function ReplaceInFilesTests(): void
{
    suite(
        replaceInFiles.name,
        () =>
        {
            let input: string;
            let expected: string;
            let tempDir: TempDirectory;
            let files: string[];

            setup(
                async () =>
                {
                    let expression = "console.log";
                    tempDir = new TempDirectory();
                    input = `nameof.full(${expression})`;
                    expected = JSON.stringify(expression);

                    files = [
                        "test/file.ts",
                        "test/subDir/file.ts",
                        "file.ts",
                        "test/huh.ts"
                    ];

                    await emptyDir(tempDir.FullName);

                    for (let file of files)
                    {
                        let path = tempDir.MakePath(file);
                        await ensureFile(path);
                        await writeFile(path, input);
                    }
                });

            /**
             * Runs the replacement function and asserts that the contents have changed accordingly.
             */
            async function runAssertion(): Promise<void>
            {
                await replaceInFiles([tempDir.MakePath("**", "*")]);

                for (let file of files)
                {
                    strictEqual(
                        (await readFile(tempDir.MakePath(file))).toString(),
                        expected);
                }
            }

            test(
                "Checking whether files can be targeted using glob patterns…",
                async () =>
                {
                    await runAssertion();
                });

            test(
                "Checking whether files without `nameof` calls in them are left unchanged…",
                async () =>
                {
                    let content = '"use strict";';
                    let filePath = tempDir.MakePath("test/vanilla.ts");
                    await ensureFile(filePath);
                    await writeFile(filePath, content);
                    await runAssertion();
                    strictEqual((await readFile(filePath)).toString(), content);
                });
        });
}
