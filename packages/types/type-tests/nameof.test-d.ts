/// <reference path="../index.d.ts" />
import { INameOfProvider } from "@typescript-nameof/common-types";
import { expectType } from "tsd";

expectType<INameOfProvider>(nameof);
