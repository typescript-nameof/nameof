# TypeScript `nameof` Types
[![Build Status](https://ci.nuth.ch/api/badges/typescript-nameof/nameof/status.svg)](https://ci.nuth.ch/typescript-nameof/nameof)

Provides type declarations for the use of the [TypeScript `nameof`][nameof] project.

TypeScript `nameof` enables you to use `nameof()` calls to determine the name of variables, properties and types:

```ts
console.log(nameof(console));   // Prints `console`
```

To find out more on how to set up TypeScript `nameof` in your project, head to the [project repository][nameof].

## Installation
Install this package using the following command:

```bash
npm install --save-dev @types/nameof@npm:@typescript-nameof/types
```

Take note that this package is installed as if it were named `@types/nameof`.
This is made because TypeScript will only automatically pick up types from packages that are named `@types/*`.
You could actually use any name you like to as long as it starts with `@types/`.

[nameof]: https://github.com/typescript-nameof/nameof
