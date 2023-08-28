import { IErrorHandler } from "@typescript-nameof/common";
import { TransformerExtras } from "ts-patch";
import type ts = require("typescript");
import { IPluginConfig } from "./IPluginConfig.cjs";
import { ITypeScriptContext } from "./ITypeScriptContext.cjs";
import { TypeScriptFeatures } from "./TypeScriptFeatures.cjs";
import { TSPatchErrorHandler } from "../Diagnostics/TSPatchErrorHandler.cjs";

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
     *
     * @param config
     * The configuration of the plugin.
     *
     * @param errorHandler
     * A component for reporting errors.
     */
    public constructor(extras: TransformerExtras, config?: IPluginConfig, errorHandler?: IErrorHandler<ts.Node, ITypeScriptContext>)
    {
        super(config, errorHandler);
        this.extras = extras;
    }

    /**
     * @inheritdoc
     */
    public override get TypeScript(): typeof ts
    {
        return this.Extras.ts;
    }

    /**
     * Gets a set of tools for interacting with `ts-patch`.
     */
    public get Extras(): TransformerExtras
    {
        return this.extras;
    }

    /**
     * @inheritdoc
     *
     * @returns
     * The newly created error handler.
     */
    protected override InitializeErrorHandler(): IErrorHandler<ts.Node, ITypeScriptContext>
    {
        return new TSPatchErrorHandler(this);
    }
}
