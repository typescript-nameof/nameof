import { ReplaceInFilesTester } from "./ReplaceInFilesTester.js";
import { ReplaceInTextTester } from "./ReplaceInTextTester.js";
import { TSJestTester } from "./TSJestTester.js";
import { TSPatchTester } from "./TSPatchTester.js";
import { TTypeScriptTester } from "./TTypeScriptTester.js";

/**
 * Registers end-to-end tests.
 */
export function EndToEndTests(): void
{
    suite(
        "End-to-End",
        () =>
        {
            new ReplaceInTextTester().Register();
            new ReplaceInFilesTester().Register();
            new TSPatchTester().Register();
            new TTypeScriptTester().Register();
            new TSJestTester().Register();
        });
}
