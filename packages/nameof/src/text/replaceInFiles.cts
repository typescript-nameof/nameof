import { readFile, writeFile } from "fs-extra";
import { replaceInText } from "./replaceInText.cjs";

/**
 * Transforms the files with the specified {@linkcode fileNames}.
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
                        let result = replaceInText(fileName, text);

                        if (result.replaced)
                        {
                            await writeFile(fileName, result.fileText ?? "");
                        }
                    })();
            }));
}
