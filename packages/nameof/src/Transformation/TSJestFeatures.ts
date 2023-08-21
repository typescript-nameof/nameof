import { IErrorHandler } from "@typescript-nameof/common";
// eslint-disable-next-line node/no-unpublished-import
import type { TsCompilerInstance } from "ts-jest/dist/types";
import type ts = require("typescript");
import { ITypeScriptContext } from "./ITypeScriptContext";
import { TypeScriptFeatures } from "./TypeScriptFeatures";
import { TSJestErrorHandler } from "../Diagnostics/TSJestErrorHandler";

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
     *
     * @param errorHandler
     * A component for reporting errors.
     */
    public constructor(compiler: TsCompilerInstance, errorHandler?: IErrorHandler<ts.Node, ITypeScriptContext>)
    {
        super(errorHandler);
        this.compiler = compiler;
    }

    /**
     * @inheritdoc
     */
    public override get TypeScript(): typeof ts
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
    protected override InitializeErrorHandler(): IErrorHandler<ts.Node, ITypeScriptContext>
    {
        return new TSJestErrorHandler(this);
    }
}
