import ts from "typescript";
import { LanguageService, server } from "typescript/lib/tsserverlibrary.js";
import { LanguageServicePlugin } from "./LanguageServicePlugin.cjs";
import { LanguageServiceValidator } from "./LanguageServiceValidator.cjs";

/**
 * Provides the functionality to hook the validation into the TypeScript compiler.
 */
export class LanguageServicePluginModule implements server.PluginModule
{
    /**
     * The TypeScript library.
     */
    private tsLibrary: typeof ts;

    /**
     * The plugins of the projects which have been initialized so far.
     */
    private plugins: Map<string, LanguageServicePlugin> = new Map();

    /**
     * A component for validating files.
     */
    private validator: LanguageServiceValidator;

    /**
     * Initializes a new instance of the {@linkcode LanguageServicePlugin} class.
     *
     * @param tsLibrary
     * The TypeScript library.
     */
    public constructor(tsLibrary: typeof ts)
    {
        this.tsLibrary = tsLibrary;
        this.validator = new LanguageServiceValidator(this.TS);
    }

    /**
     * Gets the TypeScript library.
     */
    protected get TS(): typeof ts
    {
        return this.tsLibrary;
    }

    /**
     * Gets the plugins of the projects which have been initialized so far.
     */
    protected get Plugins(): Map<string, LanguageServicePlugin>
    {
        return this.plugins;
    }

    /**
     * Gets a component for validating files.
     */
    protected get Validator(): LanguageServiceValidator
    {
        return this.validator;
    }

    /**
     * Creates a new plugin instance if necessary.
     *
     * @param createInfo
     * The options for creating the plugin instance.
     *
     * @returns
     * The decorated language service.
     */
    public create(createInfo: server.PluginCreateInfo): LanguageService
    {
        let projectName = createInfo.project.getProjectName();
        let plugin = this.Plugins.get(projectName);

        if (!plugin)
        {
            plugin = new LanguageServicePlugin(createInfo, this.Validator);
            this.Plugins.set(projectName, plugin);
        }
        else
        {
            plugin.PluginInfo = createInfo;
            plugin.Initialize();
        }

        return plugin.LanguageService;
    }

    /**
     * Handles a configuration update.
     *
     * @param config
     * The new configuration.
     */
    public onConfigurationChanged(config: any): void
    {
        for (let plugin of this.Plugins.values())
        {
            plugin.Refresh();
        }
    }
}
