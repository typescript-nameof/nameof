import { IErrorHandler } from "@typescript-nameof/common";
// eslint-disable-next-line node/no-unpublished-import
import type { TsCompilerInstance } from "ts-jest/dist/types";
import { Node } from "typescript";
import { IPluginConfig } from "./IPluginConfig.cjs";
import { ITypeScriptContext } from "./ITypeScriptContext.cjs";
import { TSJestFeatures } from "./TSJestFeatures.cjs";
import { TypeScriptTransformerBase } from "./TypeScriptTransformerBase.cjs";

/**
 * Provides the functionality to transform `nameof` in `ts-jest` nodes.
 */
export class TSJestTransformer extends TypeScriptTransformerBase<TSJestFeatures>
{
    /**
     * Initializes a new instance of the {@linkcode TSJestTransformer} class.
     *
     * @param compiler
     * The compiler of the plugin.
     *
     * @param config
     * The configuration of the plugin.
     *
     * @param errorHandler
     * A component for reporting errors.
     */
    public constructor(compiler: TsCompilerInstance, config?: IPluginConfig, errorHandler?: IErrorHandler<Node, ITypeScriptContext>)
    {
        super(new TSJestFeatures(compiler, config, errorHandler));
    }
}
