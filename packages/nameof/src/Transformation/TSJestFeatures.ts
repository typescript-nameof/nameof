import { IErrorHandler } from "@typescript-nameof/common";
import { TypeScriptFeatures } from "@typescript-nameof/tsc-transformer";
// eslint-disable-next-line node/no-unpublished-import
import type { TsCompilerInstance } from "ts-jest/dist/types";
import type ts = require("typescript");
import { TSJestErrorHandler } from "./Diagnostics/TSJestErrorHandler";

/**
 * Provides features for `ts-jest` transformations.
 */
export class TSJestFeatures extends TypeScriptFeatures
{
    /**
     * The compiler of the plugin.
     */
    private compiler: TsCompilerInstance;

    /**
     * Initializes a new instance of the {@linkcode TSJestFeatures} class.
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
    public get TypeScript(): typeof ts
    {
        return this.Compiler.configSet.compilerModule;
    }

    /**
     * Gets the compiler of the plugin.
     */
    public get Compiler(): TsCompilerInstance
    {
        return this.compiler;
    }

    /**
     * @inheritdoc
     *
     * @returns
     * The newly created error handler
     */
    protected InitializeErrorHandler(): IErrorHandler<ts.Node>
    {
        return new TSJestErrorHandler(this);
    }
}
