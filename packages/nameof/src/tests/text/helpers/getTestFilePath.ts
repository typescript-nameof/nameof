import { fileURLToPath } from "url";
import path from "upath";

const { join } = path;

/**
 * Joins the specified {@link paths `paths`} relative to the test directory.
 *
 * @param paths
 * The path segments to join.
 *
 * @returns
 * The path segments joined relative to the test directory.
 */
export function getTestFilePath(...paths: string[]): string
{
    return join(fileURLToPath(new URL(".", import.meta.url)), "..", "..", "..", "..", "test", ...paths);
}
