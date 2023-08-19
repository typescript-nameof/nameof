/**
 * Throws an error with the specified {@link message `message`} relate to the file with the specified {@link sourceFilePath `sourceFilePath`}.
 *
 * @param message
 * The message of the error to throw.
 *
 * @param sourceFilePath
 * The path to the file related to the error.
 */
export function throwErrorForSourceFile(message: string, sourceFilePath: string): never
{
    throw new Error(`[ts-nameof:${sourceFilePath}]: ${sanitizeMessage(message)}`);
}

/**
 * Gets the actual message from the specified error text.
 *
 * @param message
 * The serialized error to get the message from.
 *
 * @returns
 * The actual message inside the specified {@link message `message`}.
 */
function sanitizeMessage(message: string): string
{
    return message.replace(/^\[ts-nameof[^\]]*\]: /, "");
}
