import { Diagnostic } from "typescript";
import { TypeScriptErrorHandler } from "./TypeScriptErrorHandler";
import { TSJestFeatures } from "../TSJestFeatures";

/**
 * Provides the functionality to handle errors using `ts-jest` components.
 */
export class TSJestErrorHandler extends TypeScriptErrorHandler<TSJestFeatures>
{
    /**
     * Initializes a new instance of the {@linkcode TSJestErrorHandler} class.
     *
     * @param features
     * A component for interacting with `ts-jest`.
     */
    public constructor(features: TSJestFeatures)
    {
        super(features);
    }

    /**
     * @inheritdoc
     *
     * @param diagnostic
     * The diagnostic to report.
     */
    protected ReportDiagnostic(diagnostic: Diagnostic): void
    {
        this.Features.Compiler.configSet.raiseDiagnostics([diagnostic], diagnostic.file?.fileName);
    }
}
