import { INodeLocation } from "@typescript-nameof/common";
import { Diagnostic, Node } from "typescript";
import { TypeScriptErrorHandler } from "./TypeScriptErrorHandler.cjs";
import { ITypeScriptContext } from "../Transformation/ITypeScriptContext.cjs";
import { TSPatchFeatures } from "../Transformation/TSPatchFeatures.cjs";

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
     * @param location
     * The location of the specified {@linkcode node}.
     *
     * @param item
     * The node related to the error.
     *
     * @param context
     * The context of the operation.
     *
     * @param diagnostic
     * The diagnostic to report.
     *
     * @param error
     * The original error.
     */
    protected override ReportDiagnostic(location: INodeLocation, item: Node, context: ITypeScriptContext, diagnostic: Diagnostic, error: Error): void
    {
        this.Features.Extras.addDiagnostic(diagnostic);
    }
}
