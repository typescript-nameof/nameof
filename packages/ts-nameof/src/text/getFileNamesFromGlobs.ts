import _default from "glob";

/**
 * Searches all files which apply to the specified {@link globs `globs`}.
 *
 * @param globs
 * The globs to perform the search.
 *
 * @returns
 * The names of all files which apply to the specified {@link globs `globs`}.
 */
export function getFileNamesFromGlobs(globs: readonly string[]): Promise<string[]>
{
    const promises = globs.map(g => getFileNamesFromGlob(g));

    return Promise.all(promises).then(
        values => values.reduce(
            (a, b) => a.concat(b), []));
}

/**
 * Searches all files which apply to the specified {@link globFileName `globFileName`}.
 *
 * @param globFileName
 * The glob to perform the search.
 *
 * @returns
 * The names of all files which apply to the specified {@link globFileName `globFileName`}.
 */
function getFileNamesFromGlob(globFileName: string): Promise<string[]>
{
    return _default(globFileName);
}
