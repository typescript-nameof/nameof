import { basename } from "node:path";
import { AdapterErrorTests } from "./AdapterError.test.js";
import { CustomErrorTests } from "./CustomError.test.js";
import { IndexOutOfBoundsErrorTests } from "./IndexOutOfBoundsError.test.js";
import { IndexParsingErrorTests } from "./IndexParsingError.test.js";
import { InvalidArgumentCountErrorTests } from "./InvalidArgumentCountError.test.js";
import { InvalidDefaultCallErrorTests } from "./InvalidDefaultCallError.test.js";
import { InvalidSegmentCallErrorTests } from "./InvalidSegmentCallError.test.js";
import { MissingImportTypeQualifierErrorTests } from "./MissingImportTypeQualifierError.test.js";
import { MissingPropertyAccessErrorTests } from "./MissingPropertyAccessError.test.js";
import { NameofCallErrorTests } from "./NameofCallError.test.js";
import { NameofErrorTests } from "./NameofError.test.js";
import { NestedNameofErrorTests } from "./NestedNameofError.test.js";
import { UnsupportedAccessorTypeErrorTests } from "./UnsupportedAccessorTypeError.test.js";
import { UnsupportedFunctionErrorTests } from "./UnsupportedFunctionError.test.js";
import { UnsupportedNodeErrorTests } from "./UnsupportedNodeError.test.js";
import { UnsupportedScenarioErrorTests } from "./UnsupportedScenarioError.test.js";
import { UnusedInterpolationErrorTests } from "./UnusedInterpolationError.test.js";

/**
 * Registers tests for diagnostic components.
 */
export function DiagnosticTests(): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            AdapterErrorTests();
            NameofCallErrorTests();
            InvalidDefaultCallErrorTests();
            UnsupportedFunctionErrorTests();
            InvalidSegmentCallErrorTests();
            InvalidArgumentCountErrorTests();
            NestedNameofErrorTests();
            MissingPropertyAccessErrorTests();
            MissingImportTypeQualifierErrorTests();
            IndexParsingErrorTests();
            IndexOutOfBoundsErrorTests();
            UnsupportedNodeErrorTests();
            UnsupportedScenarioErrorTests();
            UnsupportedAccessorTypeErrorTests();
            UnusedInterpolationErrorTests();
            CustomErrorTests();
            NameofErrorTests();
        });
}
