import { IErrorHandler } from "@typescript-nameof/common";
import { TypeScriptFeatures } from "@typescript-nameof/tsc-transformer";
import { TransformerExtras } from "ts-patch";
import type ts = require("typescript");
import { TSPatchErrorHandler } from "./Diagnostics/TSPatchErrorHandler";

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
    public get TypeScript(): typeof ts
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
    protected InitializeErrorHandler(): IErrorHandler<ts.Node>
    {
        return new TSPatchErrorHandler(this);
    }
}
