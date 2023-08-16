import { IErrorHandler } from "./IErrorHandler";

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
     * @param item
     * The item related to the specified {@linkcode error}.
     *
     * @param context
     * The context of the operation.
     *
     * @param error
     * The error to report.
     */
    public Report(item: TNode, context: TContext, error: Error): void
    {
        throw error;
    }
}
