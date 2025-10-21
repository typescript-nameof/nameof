import { ok, strictEqual } from "node:assert";
import { join } from "node:path";
import { nameOf } from "ts-nameof-proxy";
import { State } from "./State.js";
import { ErrorHandler } from "../../Transformation/ErrorHandler.cjs";
import { INodeLocation } from "../../Transformation/INodeLocation.cjs";
import { ITransformationContext } from "../../Transformation/ITransformationContext.cjs";

/**
 * Registers tests for the {@linkcode ErrorHandler} class.
 */
export function ErrorHandlerTests(): void
{
    suite(
        ErrorHandler.name,
        () =>
        {
            /**
             * Provides an implementation of the {@linkcode ErrorHandler} class for testing.
             */
            class TestErrorHandler extends ErrorHandler<State, ITransformationContext<State>>
            { }

            let errorHandler: TestErrorHandler;
            let node: State;
            let location: INodeLocation;
            let error: Error;

            /**
             * Fetches the error thrown by the specified {@linkcode action}.
             *
             * @param action
             * The action to execute.
             *
             * @returns
             * The error thrown by the specified {@linkcode action}.
             */
            function fetchError(action: () => void): Error | undefined
            {
                let result: Error | undefined;

                try
                {
                    action();
                }
                catch (error)
                {
                    if (error instanceof Error)
                    {
                        result = error;
                    }
                }

                return result;
            }

            setup(
                () =>
                {
                    errorHandler = new ErrorHandler();

                    location = {
                        filePath: join(import.meta.dirname, "file.ts"),
                        line: 13,
                        column: 37
                    };

                    error = new Error("`nameof` has been slain!");
                });

            suite(
                nameOf<TestErrorHandler>((errorHandler) => errorHandler.Report),
                () =>
                {
                    let expectedText: string;

                    setup(
                        () =>
                        {
                            expectedText = `[typescript-nameof]: ${error.message}`;
                        });

                    test(
                        "Checking whether the error is prefixed with the location if available…",
                        () =>
                        {
                            let result = fetchError(() => errorHandler.Report(location, node, {}, error));
                            ok(result?.message.startsWith(`${errorHandler.DumpLocation(location)}: ${expectedText}`));
                        });

                    test(
                        "Checking whether only the error text is featured in the message if no location data is available…",
                        () =>
                        {
                            location = {};
                            let result = fetchError(() => errorHandler.Report(location, node, {}, error));
                            strictEqual(result?.message, expectedText);
                        });

                    test(
                        "Checking whether the stack trace of thrown errors is empty…",
                        () =>
                        {
                            let result = fetchError(() => errorHandler.Report(location, node, {}, error));
                            ok(result);
                            strictEqual(result.stack, undefined);
                        });
                });

            suite(
                nameOf<TestErrorHandler>((errorHandler) => errorHandler.DumpLocation),
                () =>
                {
                    let lineText: string;
                    let columnText: string;

                    setup(
                        () =>
                        {
                            lineText = `${(location.line ?? 0) + 1}`;
                            columnText = `${(location.column ?? 0) + 1}`;
                        });

                    test(
                        "Checking whether the location is prefixed with the file path if available…",
                        () =>
                        {
                            location.line = undefined;
                            location.column = undefined;
                            strictEqual(errorHandler.DumpLocation(location), location.filePath);
                        });

                    test(
                        "Checking whether the file path and further location data are separated by a colon…",
                        () =>
                        {
                            strictEqual(
                                errorHandler.DumpLocation(location),
                                `${location.filePath}:${lineText}:${columnText}`);

                            location.column = undefined;

                            strictEqual(
                                errorHandler.DumpLocation(location),
                                `${location.filePath}:${lineText}`);
                        });

                    test(
                        "Checking whether location data without a file path is dumped properly…",
                        () =>
                        {
                            location.filePath = undefined;

                            strictEqual(
                                errorHandler.DumpLocation(location),
                                `${lineText}:${columnText}`);

                            location.column = undefined;

                            strictEqual(
                                errorHandler.DumpLocation(location),
                                `${lineText}`);
                        });

                    test(
                        "Checking whether a line number is required for the column number to be dumped…",
                        () =>
                        {
                            location.line = undefined;
                            strictEqual(errorHandler.DumpLocation(location), `${location.filePath}`);

                            location.filePath = undefined;
                            strictEqual(errorHandler.DumpLocation(location), undefined);
                        });

                    test(
                        `Checking whether \`${undefined}\` is returned if no location data is available…`,
                        () =>
                        {
                            strictEqual(errorHandler.DumpLocation({}), undefined);
                        });
                });
        });
}
