import { strictEqual } from "node:assert";
import
{
    IndexOutOfBoundsError,
    IndexParsingError,
    InvalidArgumentCountError,
    InvalidDefaultCallError,
    InvalidSegmentCallError,
    MissingImportTypeQualifierError,
    MissingPropertyAccessError,
    NestedNameofError,
    NoReturnExpressionError,
    SegmentNotFoundError,
    UnsupportedAccessorTypeError,
    UnsupportedNodeError,
    UnsupportedScenarioError,
    UnusedInterpolationError
} from "@typescript-nameof/common";
import { TesterBase } from "./TesterBase.js";

/**
 * Provides the functionality to transform source code.
 *
 * @template T
 * The type of the node which are being transformed.
 */
export abstract class TransformerTester<TNode, TContext = Record<string, never>> extends TesterBase<TNode, TContext>
{
    /**
     * Gets the title of the suite.
     */
    protected get Title(): string
    {
        return "nameof";
    }

    /**
     * Gets the timeout of the tests.
     */
    protected get Timeout(): number
    {
        return 30 * 1000;
    }

    /**
     * Registers common tests.
     */
    public Register(): void
    {
        suite(
            this.Title,
            () =>
            {
                this.RegisterTests();
            });
    }

    /**
     * Registers the tests.
     */
    protected RegisterTests(): void
    {
        let timeout = this.Timeout;

        let transforms = async (input: string, expected: string): Promise<void> =>
        {
            await this.Assert(input, expected);
        };

        let reports = async (input: string, ...errors: Array<(new (...args: any[]) => Error)>): Promise<void> =>
        {
            await this.AssertError(input, ...errors);
        };

        suite(
            "nameof()",
            () =>
            {
                test(
                    "Checking whether keyword types are transformed properly…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms("nameof(this)", '"this"');
                        await transforms("nameof<any>()", '"any"');
                        await transforms("nameof<unknown>()", '"unknown"');
                        await transforms("nameof<void>()", '"void"');
                        await transforms("nameof<never>()", '"never"');
                        await transforms("nameof<object>()", '"object"');
                        await transforms("nameof<boolean>()", '"boolean"');
                        await transforms("nameof<number>()", '"number"');
                        await transforms("nameof<bigint>()", '"bigint"');
                        await transforms("nameof<string>()", '"string"');
                        await transforms("nameof<symbol>()", '"symbol"');
                    });

                test(
                    "Checking whether identifiers are transformed properly…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms("nameof(global)", '"global"');
                    });

                test(
                    "Checking whether property access expressions are transformed properly…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms("nameof(console.log)", '"log"');
                    });

                test(
                    "Checking whether property names with special characters are transformed…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms("nameof(myObject.$prop)", '"$prop"');
                    });

                test(
                    "Checking whether index access expressions are transformed properly…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms('nameof(console["warn"])', '"warn"');
                        await transforms("nameof(console.warn.name[0])", '"0"');
                    });

                test(
                    "Checking whether deeply nested properties are transformed properly…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms('nameof(this.is.a["long"].property[13 - 37].chain[420].test)', '"test"');
                    });

                test(
                    "Checking whether unsupported nodes are ignored if irrelevant…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms(
                            "nameof(/this-is-unsupported-garbage/g.flags.length)",
                            '"length"');
                    });

                test(
                    "Checking whether type references are parsed properly…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms("nameof<String>()", '"String"');
                    });

                test(
                    "Checking whether types containing special characters are transformed properly…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms("nameof<INeed$>()", '"INeed$"');
                    });

                test(
                    "Checking whether dotted type names are transformed properly…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms("nameof<NodeJS.ReadStream>()", '"ReadStream"');
                    });

                test(
                    "Checking whether index access types are transformed…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms('nameof<Console["log"]>()', '"log"');
                        await transforms('nameof<typeof Console["apply"]>()', '"apply"');
                    });

                test(
                    "Checking whether import types are parsed properly…",
                    async function()
                    {
                        this.timeout(timeout);
                        await reports(
                            'nameof<import("yeoman-generator")>()',
                            MissingImportTypeQualifierError);

                        await reports(
                            'nameof<typeof import("typescript")>()',
                            MissingImportTypeQualifierError,
                            UnsupportedNodeError);

                        await transforms('nameof<import("typescript").Node>()', '"Node"');
                    });

                test(
                    "Checking whether functions are transformed properly…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms("nameof<typeof console>((c) => c.warn)", '"warn"');
                        await transforms("nameof<typeof console>((c) => { return c.debug; })", '"debug"');
                        await transforms("nameof<typeof console>(function(c) { return c.log })", '"log"');

                        await transforms("nameof<typeof console>((c) => console)", '"console"');
                        await transforms('nameof<typeof console>((c) => console["warn"])', '"warn"');
                        await transforms("nameof<typeof console>(function (c) { console.log(); return console; })", '"console"');
                    });

                test(
                    "Checking whether unnecessary operators are ignored…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms("nameof((console as any)!)", '"console"');
                    });

                test(
                    "Checking whether invalid number of arguments cause an error…",
                    async function()
                    {
                        this.timeout(timeout);
                        let assertions = [
                            "nameof()",
                            "nameof<T1, T2>()",
                            "nameof(arg1, arg2)"
                        ];

                        for (let assertion of assertions)
                        {
                            await reports(assertion, InvalidDefaultCallError);
                        }
                    });

                test(
                    "Checking whether nested `nameof` calls cause an error…",
                    () =>
                    {
                        let assertions = [
                            "nameof",
                            "nameof.full",
                            "nameof.array",
                            "nameof.split"
                        ];

                        for (let assertion of assertions)
                        {
                            reports(`nameof(${assertion}())`, NestedNameofError);
                        }
                    });
            });

        suite(
            "nameof.full()",
            () =>
            {
                test(
                    "Checking wether general calls work as expected…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms("nameof.full(console.log)", '"console.log"');
                        await transforms("nameof.full(console['warn'].bind)", '"console[\\"warn\\"].bind"');
                        await transforms("nameof.full<NodeJS.ReadStream>()", '"NodeJS.ReadStream"');
                        await transforms('nameof.full<Console["debug"]>()', '"Console[\\"debug\\"]"');
                    });

                test(
                    "Checking whether the function can be accessed using an element accessor…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms('nameof["full"](console.log)', '"console.log"');
                    });

                test(
                    "Checking whether calls with function expressions work properly…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms('nameof.full<typeof console>((c) => c["log"])', '"[\\"log\\"]"');
                        await transforms('nameof.full<typeof console>((c) => c["log"].bind)', '"[\\"log\\"].bind"');
                        await transforms('nameof.full<typeof console>((c) => console["log"].bind)', '"console[\\"log\\"].bind"');
                    });

                test(
                    "Checking whether the index parameter is handled properly…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms("nameof.full(console.log.bind, 1)", '"log.bind"');
                        await transforms("nameof.full(console.log.bind, +1)", '"log.bind"');
                        await transforms("nameof.full<typeof console>((c) => c.log.bind, 1)", '"bind"');
                        await transforms("nameof.full<NodeJS.ReadStream>(1)", '"ReadStream"');
                    });

                test(
                    "Checking whether negative index parameters are handled properly…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms("nameof.full(console.log.bind, -1)", '"bind"');
                        await transforms("nameof.full(console.log.bind, -(-(-(1))))", '"bind"');
                        await transforms("nameof.full<typeof console>(() => console.log.bind, -3)", '"console.log.bind"');
                    });

                test(
                    "Checking whether invalid indexers are reported…",
                    async function()
                    {
                        this.timeout(timeout);
                        await reports(
                            "nameof.full(console.log.name[3 - 2])",
                            UnsupportedAccessorTypeError);
                    });
            });

        suite(
            "nameof.split()",
            () =>
            {
                test(
                    "Checking whether general calls work as expected…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms("nameof.split(console.log)", '["console", "log"]');
                        await transforms('nameof.split(console["warn"])', '["console", "warn"]');
                        await transforms("nameof.split(console.debug.name[0])", '["console", "debug", "name", "0"]');
                        await transforms("nameof.split<NodeJS.ReadStream>()", '["NodeJS", "ReadStream"]');
                        await transforms('nameof.split<Console["warn"]>()', '["Console", "warn"]');
                        await transforms('nameof.split<Console["warn"]["name"][0]>()', '["Console", "warn", "name", "0"]');
                    });

                test(
                    "Checking whether function expressions work as expected…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms("nameof.split<typeof console>((c) => c.log.bind)", '["log", "bind"]');
                        await transforms("nameof.split<Console>((c) => console.log)", '["console", "log"]');
                    });

                test(
                    "Checking whether index parameters are handled properly…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms("nameof.split(console.log, 1)", '["log"]');
                        await transforms("nameof.split<NodeJS.ReadStream>()", '["NodeJS", "ReadStream"]');
                    });
            });

        suite(
            "nameof.array()",
            () =>
            {
                test(
                    "Checking whether the array transformation works properly…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms("nameof.array(console, process, global)", '["console", "process", "global"]');
                        await transforms("nameof.array(console.log, console.warn, console, condole.debug)", '["log", "warn", "console", "debug"]');
                        await transforms("nameof.array<Console>((c) => [c.log, c.warn.bind, c.debug])", '["log", "bind", "debug"]');
                    });

                test(
                    "Checking whether missing property accessors are reported…",
                    async function()
                    {
                        this.timeout(timeout);
                        await reports(
                            "nameof.array<Console>((c) => [c, c.warn])",
                            MissingPropertyAccessError);
                    });

                test(
                    "Checking whether unsupported array elements are reported…",
                    async function()
                    {
                        this.timeout(timeout);
                        let snippets = [
                            "nameof.array([2 * 2])",
                            "nameof.array<typeof console>((c) => [c.warn, 2 * 2])"
                        ];

                        for (let snippet of snippets)
                        {
                            await reports(snippet, UnsupportedNodeError);
                        }
                    });
            });

        suite(
            "nameof.interpolate()",
            () =>
            {
                test(
                    "Checking whether any content of `interpolate` calls is dumped into the result of transformed `nameof.full` calls…",
                    async function()
                    {
                        this.timeout(timeout);
                        await transforms(
                            "nameof.full(console.log.name[nameof.interpolate((i - 3) * 2)].toString)",
                            "`console.log.name[${(i - 3) * 2}].toString`");
                    });

                test(
                    "Checking whether unaccounted `interpolate` calls are reported…",
                    async function()
                    {
                        this.timeout(timeout);
                        let snippets = [
                            "nameof.interpolate(x)",
                            "console.log(nameof.interpolate(y))"
                        ];

                        for (let snippet of snippets)
                        {
                            await reports(snippet, UnusedInterpolationError);
                        }
                    });

                test(
                    "Checking whether calling the method with an invalid number of arguments throws an error…",
                    async function()
                    {
                        this.timeout(timeout);
                        let snippets = [
                            "nameof.interpolate()",
                            "nameof.interpolate(i, j)"
                        ];

                        for (let snippet of snippets)
                        {
                            await reports(
                                `nameof.full(files[${snippet}])`,
                                InvalidArgumentCountError);
                        }
                    });
            });

        suite(
            "Common",
            () =>
            {
                test(
                    "Checking whether providing a function with no returned expression causes an error…",
                    async function()
                    {
                        this.timeout(timeout);

                        for (let call of ["nameof", "nameof.full", "nameof.split", "nameof.array"])
                        {
                            await reports(
                                `${call}<typeof console>((c) => { })`,
                                NoReturnExpressionError);

                            await reports(
                                `${call}<typeof console>(function(c) { })`,
                                NoReturnExpressionError);
                        }
                    });

                test(
                    "Checking whether nested `nameof.interpolate` calls are only allowed in `nameof.full` calls…",
                    async function()
                    {
                        this.timeout(timeout);

                        for (let call of ["nameof", "nameof.split"])
                        {
                            await reports(
                                `${call}(nameof.interpolate(7))`,
                                UnsupportedScenarioError);
                        }
                    });

                test(
                    "Checking whether unsupported nodes are reported…",
                    async function()
                    {
                        this.timeout(timeout);

                        for (let call of ["nameof", "nameof.full", "nameof.split", "nameof.array"])
                        {
                            await reports(
                                `${call}(class Test { })`,
                                UnsupportedNodeError);
                        }
                    });

                test(
                    "Checking whether returning a parameter in a function causes an error…",
                    async function()
                    {
                        this.timeout(timeout);

                        for (let call of ["nameof", "nameof.full", "nameof.split"])
                        {
                            await reports(
                                `${call}<typeof console>((a, b, c) => c)`,
                                MissingPropertyAccessError);

                            await reports(
                                `${call}<typeof console>(function (a, b, c) { return c; })`,
                                MissingPropertyAccessError);
                        }
                    });

                test(
                    "Checking whether element access expressions with invalid accessor types are reported…",
                    async function()
                    {
                        this.timeout(timeout);
                        let snippets = [
                            "console.name[2 * 2].toString"
                        ];

                        for (let call of ["nameof.full", "nameof.split"])
                        {
                            let result = await this.Transform(`${call}(${snippets}, -1)`);
                            strictEqual(result.errors.length, 0);

                            await reports(
                                `${call}(${snippets}, -2)`,
                                UnsupportedAccessorTypeError);
                        }

                        await reports("nameof(console.name[2 * 2])", UnsupportedAccessorTypeError);
                    });

                test(
                    "Checking whether invalid index parameters cause an error in nameof calls with segment support…",
                    async function()
                    {
                        this.timeout(timeout);
                        let outOfBounds = [
                            "(console.log, -3)",
                            "(console.log, 3)"
                        ];

                        let noSegmentLeft = [
                            "(console.log, 2)",
                            "(console.log.bind, 3)"
                        ];

                        let invalidIndex = [
                            "(console.log, '2')",
                            "(console.log, 2 * 7 - 13)"
                        ];

                        for (let call of ["nameof.full", "nameof.split"])
                        {
                            for (let snippet of outOfBounds)
                            {
                                await reports(`${call}${snippet}`, IndexOutOfBoundsError);
                            }

                            for (let snippet of noSegmentLeft)
                            {
                                await reports(`${call}${snippet}`, SegmentNotFoundError);
                            }

                            for (let snippet of invalidIndex)
                            {
                                await reports(`${call}${snippet}`, IndexParsingError);
                            }
                        }
                    });

                test(
                    "Checking whether passing an invalid number of arguments to nameof functions with segment support throws an error…",
                    async function()
                    {
                        this.timeout(timeout);
                        let snippets = [
                            "(console.log, 1, {})",
                            "(console.warn.bind, 2, {})"
                        ];

                        for (let call of ["nameof.full", "nameof.split"])
                        {
                            for (let snippet of snippets)
                            {
                                await reports(`${call}${snippet}`, InvalidSegmentCallError);
                            }
                        }
                    });
            });
    }
}
