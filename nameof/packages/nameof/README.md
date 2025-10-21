# TypeScript `nameof` Plugin
[![Build Status](https://ci.nuth.ch/api/badges/typescript-nameof/nameof/status.svg)](https://ci.nuth.ch/typescript-nameof/nameof)

Allows the use of `nameof()` calls in TypeScript projects.

This package provides support for `nameof()` calls for `ts-patch`, `ts-jest`, `ts-loader`, `ttypescript` and every ecosystem which supports TypeScript `TransformerFactory`s.

`nameof()` calls enable you to access the names of variables, properties and types:

```ts
console.log(nameof(this));  // Prints `this`
```

Please check out the [project repository](https://github.com/typescript-nameof/nameof) to find out more on how to set up TypeScript `nameof` in your build process.
