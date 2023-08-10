import { TransformerExtras } from "ts-patch";
import type ts = require("typescript");
import { TypeScriptFeatures } from "./TypeScriptFeatures";

/**
 * Provides the functionality to handle errors using `ts-patch` components.
 */
export class TSPatchFeatures extends TypeScriptFeatures
{
    /**
     * A set of tools for interacting with `ts-patch`.
     */
    private extras: TransformerExtras;

    /**
     * Initializes a new instance of the {@linkcode TSPatchErrorHandler} class.
     *
     * @param extras
     * A set of tools for interacting with `ts-patch`.
     */
    public constructor(extras: TransformerExtras)
    {
        super();
        this.extras = extras;
    }

    /**
     * @inheritdoc
     */
    protected get TypeScript(): typeof ts
    {
        return this.Extras.ts;
    }

    /**
     * Gets a set of tools for interacting with `ts-patch`.
     */
    protected get Extras(): TransformerExtras
    {
        return this.extras;
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
        this.Extras.addDiagnostic(diagnostic);
    }
}
