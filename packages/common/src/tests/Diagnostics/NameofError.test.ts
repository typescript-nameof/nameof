import { strictEqual } from "assert";
import { nameOf } from "ts-nameof-proxy";
import { NameofError } from "../../Diagnostics/NameofError.cjs";

/**
 * Registers tests for the {@linkcode NameofError} class.
 */
export function NameofErrorTests(): void
{
    suite(
        NameofError.name,
        () =>
        {
            let error: NameofError;
            let name: string;
            let message: string;

            setup(
                () =>
                {
                    name = "SomeRandomError";
                    message = "Some random error message.";
                    error = new NameofError(name, message);
                });

            suite(
                nameOf<NameofError>((error) => error.constructor),
                () =>
                {
                    test(
                        "Checking whether the name and the message are stored properly…",
                        () =>
                        {
                            strictEqual(error.name, name);
                            strictEqual(error.message, message);
                        });
                });

            suite(
                nameOf<NameofError>((error) => error.Name),
                () =>
                {
                    test(
                        "Checking whether the name of the error is returned…",
                        () =>
                        {
                            strictEqual(error.Name, name);
                        });
                });

            suite(
                nameOf<NameofError>((error) => error.Message),
                () =>
                {
                    test(
                        "Checking whether the message is returned…",
                        () =>
                        {
                            strictEqual(error.Message, message);
                        });
                });
        });
}
