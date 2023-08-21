import { IErrorHandler } from "./IErrorHandler";
import { INodeLocation } from "./INodeLocation";

/**
 * Provides the functionality to report errors.
 *
 * @template TNode
 * The type of the nodes to report errors for.
 *
 * @template TContext
 * The type of the context of the operation.
 */
export class ErrorHandler<TNode, TContext> implements IErrorHandler<TNode, TContext>
{
    /**
     * @inheritdoc
     *
     * @param location
     * The location of the specified {@linkcode node}.
     *
     * @param item
     * The item related to the specified {@linkcode error}.
     *
     * @param context
     * The context of the operation.
     *
     * @param error
     * The error to report.
     */
    public Report(location: INodeLocation, item: TNode, context: TContext, error: Error): void
    {
        let message = "";
        let locationText = this.DumpLocation(location);

        if (locationText)
        {
            message += `${locationText}: `;
        }

        message += `[nameof]: ${error.message}`;

        let customError = new Error(message);
        customError.stack = undefined;
        throw customError;
    }

    /**
     * Dumps the specified {@linkcode location} as a string.
     *
     * @param location
     * The location to convert.
     *
     * @returns
     * A text describing the specified {@linkcode location}.
     */
    public DumpLocation(location: INodeLocation): string | undefined
    {
        let result = "";

        if (location.filePath)
        {
            result += `${location.filePath}:`;
        }

        if (location.line)
        {
            result += `${location.line + 1}`;

            if (location.column)
            {
                result += `:${location.column + 1}`;
            }
        }

        return result === "" ? undefined : result;
    }
}
