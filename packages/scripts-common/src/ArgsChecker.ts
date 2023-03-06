/**
 * Provides the functionality to process command `nameof` arguments.
 */
export class ArgsChecker
{
    /**
     * The arguments that were provided originally.
     */
    private readonly originalArgs: readonly string[];

    /**
     * The interpreted arguments.
     */
    private readonly args: string[];

    /**
     * Initializes a new instance of the {@link ArgsChecker `ArgsChecker`} class.
     *
     * @param args
     * The provided arguments.
     */
    public constructor(args?: string[])
    {
        this.args = args ?? process.argv.slice(2);
        this.originalArgs = [...this.args];
    }

    /**
     * Checks whether an argument with the specified {@link argName `argName`} is present.
     *
     * @param argName
     * The name of the argument to check.
     *
     * @returns
     * A value indicating whether an argument with the specified {@link argName `argName`} is present.
     */
    public checkHasArg(argName: string): boolean
    {
        if (this.originalArgs.length === 0)
        {
            return true; // run all
        }

        return this.checkHasExplicitArg(argName);
    }

    /**
     * Checks whether an argument with the specified {@link argName `argName`} is present.
     *
     * @param argName
     * The name of the argument to check.
     *
     * @returns
     * A value indicating whether an argument with the specified {@link argName `argName`} is present.
     */
    public checkHasExplicitArg(argName: string): boolean
    {
        const index = this.args.indexOf(argName);

        if (index === -1)
        {
            return false;
        }

        this.args.splice(index, 1);
        return true;
    }

    /**
     * Checks whether there are no unused arguments.
     *
     * If there is an unused argument, an error is written to `console.error`.
     */
    public verifyArgsUsed(): void
    {
        if (this.args.length > 0)
        {
            console.error(`Unknown args: ${this.args.join(", ")}`);
        }
    }
}
