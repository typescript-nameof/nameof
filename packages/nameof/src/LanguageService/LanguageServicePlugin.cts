import ts, { Program } from "typescript";
import { LanguageService, server } from "typescript/lib/tsserverlibrary.js";
import { Constants } from "./Constants.cjs";
import { INameofLanguageService } from "./INameofLanguageService.cjs";
import { LanguageServiceValidator } from "./LanguageServiceValidator.cjs";

/**
 * Provides the functionality to validate files.
 */
export class LanguageServicePlugin
{
    /**
     * The context of the plugin.
     */
    private pluginInfo: server.PluginCreateInfo;

    /**
     * A component for validating files.
     */
    private validator: LanguageServiceValidator;

    /**
     * The `nameof` language service.
     */
    private nameofLanguageService: INameofLanguageService | undefined;

    /**
     * Initializes a new instance of the {@linkcode LanguageServicePlugin} class.
     *
     * @param pluginInfo
     * The context of the plugin.
     *
     * @param validator
     * A component for validating files.
     */
    public constructor(pluginInfo: server.PluginCreateInfo, validator: LanguageServiceValidator)
    {
        this.pluginInfo = pluginInfo;
        this.validator = validator;
    }

    /**
     * Gets or sets the context of the plugin.
     */
    public get PluginInfo(): server.PluginCreateInfo
    {
        return this.pluginInfo;
    }

    /**
     * @inheritdoc
     */
    public set PluginInfo(value)
    {
        this.pluginInfo = value;
    }

    /**
     * Gets the language service of the plugin.
     */
    public get LanguageService(): LanguageService
    {
        if (!this.nameofLanguageService)
        {
            this.nameofLanguageService = this.Decorate();
        }

        return this.nameofLanguageService;
    }

    /**
     * Gets a component for validating files.
     */
    protected get Validator(): LanguageServiceValidator
    {
        return this.validator;
    }

    /**
     * Gets the program of the transformation.
     */
    protected get Program(): Program | undefined
    {
        return this.LanguageService.getProgram();
    }

    /**
     * Initializes the plugin.
     */
    public Initialize(): void
    {
        this.nameofLanguageService = undefined;
    }

    /**
     * Refreshes the diagnostics.
     */
    public Refresh(): void
    {
        this.PluginInfo.project.refreshDiagnostics();
    }

    /**
     * Decorates the language service if necessary.
     *
     * @returns
     * The decorated language service.
     */
    protected Decorate(): LanguageService
    {
        let languageService: INameofLanguageService = this.PluginInfo.languageService;

        if (languageService[Constants.PluginInstalledSymbol])
        {
            return languageService;
        }
        else
        {
            let proxy: INameofLanguageService = Object.create(null);

            for (let key of Object.keys(languageService) as Array<keyof ts.LanguageService>)
            {
                const original = languageService[key] as (...args: any[]) => any;
                proxy[key] = (...args: any[]) => original.apply(languageService, args);
            }

            proxy.getSemanticDiagnostics = (fileName) =>
            {
                let result = languageService.getSemanticDiagnostics(fileName);
                let program = this.Program;

                if (program)
                {
                    let sourceFile = program.getSourceFile(fileName);

                    if (sourceFile)
                    {
                        result.push(...this.Validator.Validate(sourceFile, program.getCompilerOptions()));
                    }
                }

                return result;
            };

            return proxy;
        }
    }
}
