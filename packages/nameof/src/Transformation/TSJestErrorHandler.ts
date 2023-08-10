// eslint-disable-next-line node/no-unpublished-import
import type { TsCompilerInstance } from "ts-jest/dist/types";
import type ts = require("typescript");
import { ErrorHandler } from "./ErrorHandler";

/**
 * Provides the functionality to handle errors using `ts-jest` components.
 */
export class TSJestErrorHandler extends ErrorHandler
{
    /**
     * The compiler of the plugin.
     */
    private compiler: TsCompilerInstance;

    /**
     * Initializes a new instance of the {@linkcode TSJestErrorHandler} class.
     *
     * @param compiler
     * The compiler of the plugin.
     */
    public constructor(compiler: TsCompilerInstance)
    {
        super();
        this.compiler = compiler;
    }

    /**
     * @inheritdoc
     */
    protected get TypeScript(): typeof ts
    {
        return this.Compiler.configSet.compilerModule;
    }

    /**
     * Gets the compiler of the plugin.
     */
    protected get Compiler(): TsCompilerInstance
    {
        return this.compiler;
    }

    /**
     * @inheritdoc
     *
     * @param file
     * The file related to the error.
     *
     * @param node
     * The node related to the error.
     *
     * @param error
     * The error to process.
     */
    public Process(file: ts.SourceFile, node: ts.Node, error: Error): void
    {
        this.Compiler.configSet.raiseDiagnostics(
            [
                this.GetDiagnostic(file, node, error)
            ]);
    }
}
