import * as fs from "fs";

/**
 * Reads the contents of the file at the specified {@link path `path`}.
 *
 * @param path
 * The name of the file to read.
 *
 * @returns
 * The contents of the file located at the specified {@link path `path`}.
 */
export async function readFile(path: string): Promise<string>
{
    return new Promise<string>(
        (resolve, reject) =>
        {
            fs.readFile(
                path,
                { encoding: "utf-8" },
                (err, data) =>
                {
                    if (err)
                    {
                        reject(err);
                        return;
                    }

                    resolve(data);
                });
        });
}

/**
 * Writes the specified {@link contents `contents`} to the file located at the specified {@link path `path`}.
 *
 * @param path
 * The name of the file to write.
 *
 * @param contents
 * The contents to write.
 */
export async function writeFile(path: string, contents: string): Promise<void>
{
    return new Promise<void>(
        (resolve, reject) =>
        {
            fs.writeFile(
                path,
                contents,
                err =>
                {
                    if (err)
                    {
                        reject(err);
                        return;
                    }

                    resolve();
                });
        });
}
