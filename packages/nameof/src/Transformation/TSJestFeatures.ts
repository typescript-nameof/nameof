// eslint-disable-next-line node/no-unpublished-import
import type { TsCompilerInstance } from "ts-jest/dist/types";
import type ts = require("typescript");
import { TypeScriptFeatures } from "./TypeScriptFeatures";
/**
 * Provides the functionality to handle errors using `ts-jest` components.
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
     * The file related to the diagnostic.
     *
     * @param diagnostic
     * The diagnostic to report.
     */
    public ReportDiagnostic(file: ts.SourceFile, diagnostic: ts.Diagnostic): void
    {
        this.Compiler.configSet.raiseDiagnostics([diagnostic]);
    }
}
