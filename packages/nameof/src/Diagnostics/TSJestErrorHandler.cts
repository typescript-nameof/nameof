import { INodeLocation } from "@typescript-nameof/common";
import { Diagnostic, Node } from "typescript";
import { TypeScriptErrorHandler } from "./TypeScriptErrorHandler.cjs";
import { ITypeScriptContext } from "../Transformation/ITypeScriptContext.cjs";
import { TSJestFeatures } from "../Transformation/TSJestFeatures.cjs";

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
        this.Features.Compiler.configSet.raiseDiagnostics([diagnostic], diagnostic.file?.fileName);
    }
}
