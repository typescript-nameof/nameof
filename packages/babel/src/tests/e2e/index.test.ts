import { BabelMacroTester } from "./BabelMacroTester.js";
import { BabelPluginTester } from "./BabelPluginTester.js";

/**
 * Registers tests for purpose
 */
export function EndToEndTests(): void
{
    suite(
        "End-to-End",
        () =>
        {
            new BabelPluginTester().RegisterCommon();
            new BabelMacroTester().RegisterCommon();
        });
}
