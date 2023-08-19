import { readFile, writeFile } from "fs-extra";
import { replaceInText } from "./replaceInText";

/**
 * Transforms the files with the specified {@link fileNames `fileNames`}.
 *
 * @param fileNames
 * The names of the files to transform.
 */
export async function replaceInFiles(fileNames: readonly string[]): Promise<void>
{
    const { globby } = await import("globby");

    await Promise.all(
        (await globby(fileNames)).map(
            (fileName) =>
            {
                return (
                    async () =>
                    {
                        let text = await readFile(fileName, { encoding: "utf-8" });
                        await writeFile(fileName, replaceInText(fileName, text).fileText ?? "");
                    })();
            }));
}
