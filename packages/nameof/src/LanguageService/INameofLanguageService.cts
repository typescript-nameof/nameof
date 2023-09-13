import { LanguageService } from "typescript/lib/tsserverlibrary.js";
import { Constants } from "./Constants.cjs";

/**
 * Represents a `nameof` language service.
 */
export interface INameofLanguageService extends LanguageService
{
    /**
     * A value indicating whether the plugin has been installed.
     */
    [Constants.PluginInstalledSymbol]?: boolean;
}
