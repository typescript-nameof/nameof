# TypeScript `nameof` Babel.js
![npm version](https://img.shields.io/npm/v/@typescript-nameof/babel-plugin)

Allows the use of `nameof()` calls in babel projects.

Using this Babel.js plugin, you are able to use `nameof()` calls for finding out the name of variables, properties and types:

```ts
console.log(nameof(console));   // Prints `console`
```

Furthermore, this package provides an integration for the `babel-plugin-macros` package:

```ts
import myNameof from "@typescript-nameof/babel/macro";

console.log(myNameof(console)); // Prints `console`
```

If you would like to find out more about this project or how to set up TypeScript `nameof` in your Babel.js project, check out the [repository of the project](https://github.com/typescript-nameof/nameof).
