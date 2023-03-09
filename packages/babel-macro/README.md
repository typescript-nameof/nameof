# @typescript-nameof/babel-macro

![npm version](https://img.shields.io/npm/v/@typescript-nameof/babel-macro)
[![Build Status](https://ci.nuth.ch/api/badges/typescript-nameof/nameof/status.svg)](https://ci.nuth.ch/typescript-nameof/nameof)
[![Babel Macro](https://img.shields.io/badge/babel--macro-%F0%9F%8E%A3-f5da55.svg)](https://github.com/kentcdodds/babel-plugin-macros)

[`nameof`](https://msdn.microsoft.com/en-us/library/dn986596.aspx) in TypeScript.

This is a [babel macro](https://github.com/kentcdodds/babel-plugin-macros) of [ts-nameof](https://github.com/typescript-nameof/nameof).

## Setup

1. Install dependencies:

```
npm install --save-dev babel-plugin-macros @typescript-nameof/babel-macro
```

2. Ensure `babel-plugin-macros` is properly setup ([Instructions](https://github.com/kentcdodds/babel-plugin-macros/blob/master/other/docs/user.md)).

3. Import and use the default export. For example:

```ts
import nameof from "@typescript-nameof/babel-macro";

nameof(window.alert);
```

Transforms to:

```ts
"alert";
```

## Transforms

[Read here](https://github.com/typescript-nameof/nameof/blob/master/README.md)

## Other

- [Contributing](https://github.com/typescript-nameof/nameof/blob/master/CONTRIBUTING.md)
- [Development](https://github.com/typescript-nameof/nameof/blob/master/DEVELOPMENT.md)
