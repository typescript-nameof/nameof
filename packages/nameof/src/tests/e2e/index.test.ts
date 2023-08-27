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
            new ReplaceInTextTester().RegisterCommon();
            new ReplaceInFilesTester().RegisterCommon();
            new TSPatchTester().RegisterCommon();
            new TTypeScriptTester().RegisterCommon();
            new TSJestTester().RegisterCommon();
        });
}
