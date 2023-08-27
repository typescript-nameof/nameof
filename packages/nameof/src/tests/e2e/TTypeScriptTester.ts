import { execSync, spawnSync } from "child_process";
import { createRequire } from "module";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { Package, PackageType } from "@manuth/package-json-editor";
import { TempDirectory } from "@manuth/temp-files";
import { IErrorHandler } from "@typescript-nameof/common";
import { INameofOutput, TransformerTester } from "@typescript-nameof/tests-common";
import fs from "fs-extra";

const { readFile, writeFile, writeJson } = fs;

/**
 * Provides the functionality to test the `ts-patch` integration.
 */
export class TTypeScriptTester extends TransformerTester<any, any>
{
    /**
     * @inheritdoc
     */
    protected override get Title(): string
    {
        return "ttypescript";
    }

    /**
     * The name of the file to write the tests to.
     */
    protected get FileBaseName(): string
    {
        return "file";
    }

    /**
     * @inheritdoc
     */
    protected override RegisterTests(): void
    {
        let self = this;
        let tempDir: TempDirectory;
        let workingDirectory: string;

        suiteSetup(
            async function()
            {
                let dirName = fileURLToPath(new URL(".", import.meta.url));
                let require = createRequire(import.meta.url);
                this.timeout(1 * 60 * 1000);
                let npmPackage = new Package();
                tempDir = new TempDirectory();
                workingDirectory = process.cwd();
                process.chdir(tempDir.FullName);
                npmPackage.Type = PackageType.CommonJS;
                await writeJson(tempDir.MakePath(Package.FileName), npmPackage.ToJSON());
                execSync("npm install --save typescript@4 ttypescript", { cwd: tempDir.FullName });

                execSync(
                    `npm install --save @types/nameof@file:${resolve(dirName, "../../../../types")}`,
                    { cwd: tempDir.FullName });

                await writeJson(
                    tempDir.MakePath("tsconfig.json"),
                    {
                        files: [
                            `./${self.FileBaseName}`
                        ],
                        compilerOptions: {
                            rootDir: ".",
                            outDir: ".",
                            plugins: [
                                {
                                    transform: require.resolve("../../../")
                                }
                            ]
                        }
                    });
            });

        suiteTeardown(
            () =>
            {
                tempDir.Dispose();
                process.chdir(workingDirectory);
            });

        super.RegisterTests();
    }

    /**
     * @inheritdoc
     *
     * @param code
     * The code to transform.
     *
     * @param errorHandler
     * A component for reporting errors.
     *
     * @returns
     * The transformed representation of the specified {@linkcode code}.
     */
    protected override async Run(code: string, errorHandler?: IErrorHandler<any, any> | undefined): Promise<string>
    {
        await writeFile(`${this.FileBaseName}.ts`, `// @ts-ignore\n${code}`);

        let result = spawnSync(
            "npx",
            [
                "ttsc",
                "-p",
                "."
            ]);

        if (result.status === 0)
        {
            return (await readFile(`${this.FileBaseName}.js`)).toString();
        }
        else
        {
            let error = new Error("Unknown error");
            errorHandler?.Report({}, {}, {}, error);
            throw error;
        }
    }

    /**
     * @inheritdoc
     *
     * @param input
     * The input of the transformation.
     *
     * @param result
     * The output of the transformation.
     */
    protected override async HasError(input: string, result: INameofOutput): Promise<void>
    {
        await super.HasError(input, result);
    }
}
