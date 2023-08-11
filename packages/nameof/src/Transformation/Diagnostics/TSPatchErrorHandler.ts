import { TypeScriptErrorHandler } from "@typescript-nameof/tsc-transformer";
import { Diagnostic } from "typescript";
import { TSPatchFeatures } from "../TSPatchFeatures";

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
     * @param diagnostic
     * The diagnostic to report.
     */
    public ReportDiagnostic(diagnostic: Diagnostic): void
    {
        this.Features.Extras.addDiagnostic(diagnostic);
    }
}
