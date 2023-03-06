import * as fs from "fs";
import { getFileNamesFromGlobs } from "./getFileNamesFromGlobs";
import { replaceInText } from "./replaceInText";

/**
 * Transforms the files with the specified {@link fileNames `fileNames`}.
 *
 * @param fileNames
 * The names of the files to transform.
 */
export async function replaceInFiles(fileNames: readonly string[]): Promise<void[]>
{
    return getFileNamesFromGlobs(fileNames).then(globbedFileNames => doReplaceInFiles(globbedFileNames));
}

/**
 * Transforms the files with the specified {@link fileNames `fileNames`}.
 *
 * @param fileNames
 * The names of the files to transform.
 */
async function doReplaceInFiles(fileNames: readonly string[]): Promise<void[]>
{
    const promises: Array<Promise<void>> = [];

    fileNames.forEach(
        fileName =>
        {
            promises.push(
                new Promise<void>(
                    (resolve, reject) =>
                    {
                        fs.readFile(
                            fileName,
                            { encoding: "utf8" },
                            (err, fileText) =>
                            {
                                /* istanbul ignore if */
                                if (err)
                                {
                                    reject(err);
                                    return;
                                }

                                const result = replaceInText(fileName, fileText);

                                if (result.replaced)
                                {
                                    fs.writeFile(
                                        fileName,
                                        result.fileText ?? "",
                                        writeErr =>
                                        {
                                            /* istanbul ignore if */
                                            if (writeErr)
                                            {
                                                reject(writeErr);
                                                return;
                                            }

                                            resolve();
                                        });
                                }
                                else
                                {
                                    resolve();
                                }
                            });
                    })
            );
        });

    return Promise.all(promises);
}
