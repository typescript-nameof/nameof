import { createRequire } from "module";
import { INodeLocation, TransformerFeatures } from "@typescript-nameof/common";
import { IErrorHandler } from "@typescript-nameof/common/src/Transformation/IErrorHandler";
import type ts = require("typescript");
import { IPluginConfig } from "./IPluginConfig";
import { ITypeScriptContext } from "./ITypeScriptContext";
import { TypeScriptErrorHandler } from "../Diagnostics/TypeScriptErrorHandler";

/**
 * Provides features for transforming TypeScript code.
 */
export class TypeScriptFeatures extends TransformerFeatures<ts.Node, ITypeScriptContext>
{
    /**
     * The configuration of the transformer.
     */
    private config?: IPluginConfig;

    /**
     * Initializes a new instance of the {@linkcode TransformerFeatures TypeScriptFeatures<T>} class.
     *
     * @param config
     * The configuration of the plugin.
     *
     * @param errorHandler
     * A component for reporting errors.
     */
    public constructor(config?: IPluginConfig, errorHandler?: IErrorHandler<ts.Node, ITypeScriptContext>)
    {
        super(errorHandler);
        this.config = config;
    }

    /**
     * Gets an instance of a TypeScript compiler.
     */
    public get TypeScript(): typeof ts
    {
        if (this.Config?.tsLibrary)
        {
            if (typeof this.Config.tsLibrary === "string")
            {
                return createRequire(process.cwd())(this.Config.tsLibrary);
            }
            else
            {
                return this.Config.tsLibrary;
            }
        }
        else
        {
            return this.TypeScriptFallback;
        }
    }

    /**
     * Gets a fallback instance of typescript in case no `typescript` instance was found in the configuration.
     */
    protected get TypeScriptFallback(): typeof ts
    {
        return createRequire(process.cwd())("typescript");
    }

    /**
     * Gets the configuration of the transformer.
     */
    protected get Config(): IPluginConfig | undefined
    {
        return this.config;
    }

    /**
     * Reports the specified {@linkcode error}.
     *
     * @param location
     * The location of the specified {@linkcode node}.
     *
     * @param node
     * The node related to the error.
     *
     * @param context
     * The context of the operation.
     *
     * @param error
     * The error to process.
     */
    public override ReportError(location: INodeLocation, node: ts.Node, context: ITypeScriptContext, error: Error): void
    {
        this.ErrorHandler?.Report(location, node, context, error);
    }

    /**
     * Initializes a new error handler.
     *
     * @returns
     * The newly created error handler.
     */
    protected override InitializeErrorHandler(): IErrorHandler<ts.Node, ITypeScriptContext>
    {
        return new TypeScriptErrorHandler(this);
    }
}
