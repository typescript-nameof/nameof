import { ErrorHandler } from "@typescript-nameof/common";
// eslint-disable-next-line n/no-unpublished-import
import type { TsCompilerInstance } from "ts-jest/dist/types";
import { TransformerExtras } from "ts-patch";
import { Program, SourceFile, TransformationContext, Transformer, TransformerFactory } from "typescript";
import { server } from "typescript/lib/tsserverlibrary";
import { LanguageServicePluginModule } from "./LanguageService/LanguageServicePluginModule.cjs";
import * as text from "./text/index.cjs";
import { TSJestTransformer } from "./Transformation/TSJestTransformer.cjs";
import { TSPatchTransformer } from "./Transformation/TSPatchTransformer.cjs";
import * as adapter from "./Transformation/TypeScriptAdapter.cjs";
import * as vanillaFeatures from "./Transformation/TypeScriptFeatures.cjs";
import { TypeScriptTransformer } from "./Transformation/TypeScriptTransformer.cjs";
import * as meta from "./version.cjs";

/**
 * Represents the context of a language service plugin creation.
 */
type PluginContext = Parameters<server.PluginModuleFactory>[0];

/**
 * Creates a `nameof` transformer for vanilla TypeScript.
 *
 * @param context
 * The context of the TypeScript transformation.
 */
function nameof(context: TransformationContext): Transformer<SourceFile>;

/**
 * Creates a language service for validating `nameof` calls.
 *
 * @param context
 * The context of the TypeScript language service.
 */
function nameof(context: PluginContext): server.PluginModule;

/**
 * Creates a `nameof` transformer for `ts-patch`.
 *
 * @param program
 * The program which is being transformed.
 *
 * @param config
 * The configuration of the plugin.
 *
 * @param extras
 * A set of components to interact with `ts-patch`.
 */
function nameof(program: Program, config?: Record<string, unknown>, extras?: TransformerExtras): TransformerFactory<SourceFile>;

/**
 * Creates a `nameof` transformer for the detected ecosystem (vanilla TypeScript or `ts-patch`).
 *
 * @param args
 * The arguments provided by the ecosystem.
 *
 * @returns
 * A transformer for the corresponding ecosystem.
 */
function nameof(...args: [Program | Parameters<server.PluginModuleFactory>[0], Record<string, unknown>?, TransformerExtras?] | [TransformationContext]): TransformerFactory<SourceFile> | Transformer<SourceFile> | ReturnType<server.PluginModuleFactory>
{
    let factory: TransformerFactory<SourceFile>;

    if ("typescript" in args[0])
    {
        return new LanguageServicePluginModule(args[0].typescript as any);
    }
    else
    {
        if (
            args[2]?.addDiagnostic)
        {
            // Detecting `ts-patch` (ttypescript's `addDiagnostic` implementation doesn't do anything)
            if (args[2].diagnostics)
            {
                factory = new TSPatchTransformer(args[2]).Factory;
            }
            else
            {
                factory = new TSPatchTransformer(args[2], undefined, new ErrorHandler()).Factory;
            }
        }
        else
        {
            factory = new TypeScriptTransformer().Factory;
        }

        if ("factory" in args[0])
        {
            return factory(args[0]);
        }
        else
        {
            return factory;
        }
    }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace nameof
{
    /**
     * The version of the plugin.
     */
    export import version = meta.version;

    export import replaceInFiles = text.replaceInFiles;
    export import replaceInText = text.replaceInText;

    /**
     * Creates a transformer for `ts-jest`.
     *
     * @param compiler
     * The `ts-jest` compiler instance.
     *
     * @returns
     * The newly created {@linkcode TransformerFactory}.
     */
    export function factory(compiler: TsCompilerInstance): TransformerFactory<SourceFile>
    {
        return new TSJestTransformer(compiler).Factory;
    }

    export import TypeScriptAdapter = adapter.TypeScriptAdapter;
    export import TypeScriptFeatures = vanillaFeatures.TypeScriptFeatures;
}

export = nameof;
