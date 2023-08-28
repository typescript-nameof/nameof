/// <reference path="../index.d.cts" />
import { INameOfProvider } from "@typescript-nameof/common-types";
import { expectType } from "tsd";

expectType<INameOfProvider>(nameof);
