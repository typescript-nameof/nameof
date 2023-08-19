import { Diagnostic } from "typescript";
import { TypeScriptErrorHandler } from "./TypeScriptErrorHandler";
import { TSPatchFeatures } from "../Transformation/TSPatchFeatures";

/**
 * Provides the functionality to handle errors using `ts-patch` components.
 */
export class TSPatchErrorHandler extends TypeScriptErrorHandler<TSPatchFeatures>
{
    /**
     * Initializes a new instance of the {@linkcode TSPatchErrorHandler} class.
     *
     * @param features
     * A set of features for interacting with `ts-patch`.
     */
    public constructor(features: TSPatchFeatures)
    {
        super(features);
    }

    /**
     * @inheritdoc
     *
     * @param error
     * The original error.
     *
     * @param diagnostic
     * The diagnostic to report.
     */
    public ReportDiagnostic(error: Error, diagnostic: Diagnostic): void
    {
        this.Features.Extras.addDiagnostic(diagnostic);
    }
}
