import { notStrictEqual, strictEqual } from "node:assert";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { join } from "node:path";
import { Package } from "@manuth/package-json-editor";
import { TempDirectory } from "@manuth/temp-files";
import fs from "fs-extra";
import { ts } from "ts-morph";
import { nameOf } from "ts-nameof-proxy";
import { IPluginConfig } from "../../Transformation/IPluginConfig.cjs";
import { TypeScriptFeatures } from "../../Transformation/TypeScriptFeatures.cjs";

const { writeJson } = fs;

/**
 * Registers tests for the {@linkcode TypeScriptFeatures} class.
 */
export function TypeScriptFeatureTests(): void
{
    suite(
        TypeScriptFeatures.name,
        () =>
        {
            /**
             * Provides an implementation of the {@linkcode TypeScriptFeatures} class for testing.
             */
            class TestFeatures extends TypeScriptFeatures
            {
                /**
                 * @inheritdoc
                 */
                public override get TypeScriptFallback(): typeof import("typescript")
                {
                    return super.TypeScriptFallback;
                }
            }

            let tempDir: TempDirectory;
            let config: IPluginConfig;
            let features: TestFeatures;

            suiteSetup(
                async function()
                {
                    this.timeout(1 * 60 * 1000);
                    let npmPackage = new Package();
                    tempDir = new TempDirectory();
                    await writeJson(tempDir.MakePath(Package.FileName), npmPackage.ToJSON(), { spaces: 2 });
                    spawnSync("npm install typescript", { cwd: tempDir.FullName });
                });

            suiteTeardown(
                () =>
                {
                    tempDir.Dispose();
                });

            setup(
                () =>
                {
                    config = {};
                    features = new TestFeatures(config);
                });

            suite(
                nameOf<TestFeatures>((features) => features.TypeScript),
                () =>
                {
                    test(
                        "Checking if the configured typescript instance is returned if specified…",
                        () =>
                        {
                            config.tsLibrary = ts as any;
                            notStrictEqual(features.TypeScript, features.TypeScriptFallback);
                            strictEqual(features.TypeScript, ts);
                        });

                    test(
                        "Checking whether the fallback instance is used otherwise…",
                        () =>
                        {
                            strictEqual(features.TypeScript, features.TypeScriptFallback);
                        });
                });

            suite(
                nameOf<TestFeatures>((features) => features.TypeScriptFallback),
                () =>
                {
                    let tsModule = "typescript";

                    test(
                        `Checking whether the \`${tsModule}\` module is imported by default…`,
                        () =>
                        {
                            strictEqual(features.TypeScriptFallback, createRequire(join(process.cwd(), ".js"))(tsModule));
                        });
                });
        });
}
