import { ok } from "node:assert";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { TempDirectory } from "@manuth/temp-files";
import { LanguageServiceTester as ServiceTester } from "@manuth/typescript-languageservice-tester";
import { IErrorHandler } from "@typescript-nameof/common";
import { INameofOutput, TransformerTester } from "@typescript-nameof/test";
import fs from "fs-extra";
import { Constants } from "../../Constants.cjs";

const { writeJSON } = fs;

/**
 * Provides the functionality to test the language service plugin.
 */
export class LanguageServiceTester extends TransformerTester<any, any>
{
    /**
     * The temporary directory of the tester.
     */
    private tempDir: TempDirectory = undefined as any;

    /**
     * Provides the functionality to test a language service plugin.
     */
    private tester: ServiceTester = undefined as any;

    /**
     * @inheritdoc
     */
    protected override get Title(): string
    {
        return "Language Service Plugin";
    }

    /**
     * @inheritdoc
     */
    protected override get Timeout(): number
    {
        return 5 * 60 * 1000;
    }

    /**
     * @inheritdoc
     */
    protected override RegisterTests(): void
    {
        let self = this;

        suiteSetup(
            async function()
            {
                this.timeout(1 * 60 * 1000);
                self.tempDir = new TempDirectory();
                self.tester = new ServiceTester(self.tempDir.FullName);
                await self.tester.Install();

                spawnSync(
                    "npm",
                    [
                        "install",
                        `@typescript-nameof/nameof@file:${fileURLToPath(new URL("../../..", import.meta.url))}`
                    ],
                    {
                        cwd: self.tempDir.FullName
                    });

                await writeJSON(
                    self.tempDir.MakePath("tsconfig.json"),
                    {
                        compilerOptions: {
                            plugins: [
                                {
                                    name: "@typescript-nameof/nameof"
                                }
                            ]
                        }
                    });
            });

        suiteTeardown(
            async function()
            {
                this.timeout(30 * 1000);
                await self.tester.Dispose();
                self.tempDir.Dispose();
            });

        super.RegisterTests();
    }

    /**
     * @inheritdoc
     *
     * @param code
     * The code to test.
     *
     * @param errorHandler
     * A component for reporting errors.
     *
     * @returns
     * The transformed code.
     */
    protected override async Run(code: string, errorHandler?: IErrorHandler<any, any> | undefined): Promise<string>
    {
        let result = await this.tester.AnalyzeCode(code);

        for (let diagnostic of result.Diagnostics)
        {
            if (diagnostic.Source === Constants.SourceName)
            {
                errorHandler?.Report({}, {}, {}, new Error(diagnostic.Message));
            }
        }

        return "";
    }

    /**
     * @inheritdoc
     *
     * @param input
     * The input of the transformation.
     *
     * @param result
     * The output of the transformation.
     *
     * @param errorClasses
     * The expected errors.
     */
    protected override async HasError(input: string, result: INameofOutput, ...errorClasses: Array<(new (...args: any[]) => Error)>): Promise<void>
    {
        ok(result.errors.length > 0);
    }

    /**
     * @inheritdoc
     */
    protected override async CodeEquals(): Promise<void>
    { }
}
