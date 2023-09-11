/**
 * Provides constants for the language service.
 */
export class Constants
{
    /**
     * Gets the description of the `nameof` language service symbol.
     */
    public static readonly PluginInstalledDescription = "__typescriptNameofPluginInstalled__";

    /**
     * Gets the `nameof` language service symbol.
     */
    public static readonly PluginInstalledSymbol: unique symbol = Symbol(Constants.PluginInstalledDescription);
}
