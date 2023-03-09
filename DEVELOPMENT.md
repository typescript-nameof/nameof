# Development

## Building

Open the root directory of the repo and run:

```bash
# install dependencies
npm install
# build
npm run build
```

## Packages

- [packages/babel-plugin](packages/babel-plugin) - Transform plugin for Babel.
- [packages/core](packages/core) - Common code used by almost everything.
- [packages/scripts-common](packages/scripts-common) - Common scripts used by other packages.
- [packages/tests-common](packages/tests-common) - Tests used by some packages. Write all your transform tests here.
- [packages/babel-transformer](packages/babel-transformer) - Transforms from the Babel AST to the Common AST.
- [packages/transformer-core](packages/transformer-core) - Nameof transforms done in the Common AST.
- [packages/tsc-transformer](packages/tsc-transformer) - Transforms from the TypeScript AST to the Common AST.
- [packages/nameof](packages/nameof) - nameof library for the TypeScript compiler.
- [packages/babel-macro](packages/babel-macro) - nameof library for Babel macros.

## Standard Commands

```bash
# build (run in root dir)
npm run build
# run tests (run in root dir)
npm test
# format the code
npm run lint -- --fix
```

### Clean Rebuild

```
npm run clean && npm run build
```

## Declaration File

### Global Definitions

The global definitions are stored in [lib/global.d.ts](lib/global.d.ts). To make changes:

1. Add a failing test in [lib/global.tests.ts](lib/global.tests.ts) (failing test means you get a compile error)
2. Update [lib/global.d.ts](lib/global.d.ts).
3. Run `npm run create-declaration-file` in the root directory

### ts-nameof - Updating API

1. Update [packages/nameof/lib/declarationFileTests.ts](packages/nameof/lib/declarationFileTests.ts) with a failing test.
2. Update the API in [packages/nameof/src/main.ts](packages/nameof/src/main.ts).
3. Run `npm run create-declaration-file` in the root directory

## After Development

Run the following command in the root directory, which will check that everything is good:

```bash
npm run verify
```
