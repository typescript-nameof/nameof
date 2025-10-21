import { EndToEndTests } from "./e2e/index.test.js";
import { TransformationTests } from "./Transformation/index.test.js";

suite(
    "babel",
    () =>
    {
        TransformationTests();
        EndToEndTests();
    });
