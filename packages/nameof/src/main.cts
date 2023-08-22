// eslint-disable-next-line node/no-unpublished-import
import type { TsCompilerInstance } from "ts-jest/dist/types";
import { TransformerExtras } from "ts-patch";
import { Program, SourceFile, TransformationContext, Transformer, TransformerFactory } from "typescript";
import * as text from "./text/index.cjs";
import { TSJestTransformer } from "./Transformation/TSJestTransformer.cjs";
import { TSPatchTransformer } from "./Transformation/TSPatchTransformer.cjs";
import * as adapter from "./Transformation/TypeScriptAdapter.cjs";
import * as vanillaFeatures from "./Transformation/TypeScriptFeatures.cjs";
import { TypeScriptTransformer } from "./Transformation/TypeScriptTransformer.cjs";

import * as meta from "./version.cjs";

/**
 * Creates a `nameof` transformer for vanilla TypeScript.
 *
 * @param context
 * The context of the TypeScript transformation.
 */
function nameof(context: TransformationContext): Transformer<SourceFile>;

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
function nameof(...args: [Program, Record<string, unknown>?, TransformerExtras?] | [TransformationContext]): TransformerFactory<SourceFile> | Transformer<SourceFile>
{
    let factory: TransformerFactory<SourceFile>;

    if (
        args[2]?.addDiagnostic &&
        // Detecting `ts-patch` (ttypescript's `addDiagnostic` implementation doesn't do anything)
        args[2].diagnostics)
    {
        factory = new TSPatchTransformer(args[2]).Factory;
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

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace nameof
{
    /**
     * The version of the plugin.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    export import version = meta.version;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    export import replaceInFiles = text.replaceInFiles;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    export import TypeScriptAdapter = adapter.TypeScriptAdapter;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    export import TypeScriptFeatures = vanillaFeatures.TypeScriptFeatures;
}

export = nameof;
