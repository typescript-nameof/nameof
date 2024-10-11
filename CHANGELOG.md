# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## TypeScript `nameof` [Unreleased]

[Show differences](https://github.com/typescript-nameof/nameof/compare/v0.0.11...dev)

## TypeScript `nameof` v0.0.11
### Updated
  - All dependencies
  - Updated type declarations to apply to `@typescript-eslint/no-unsafe-call`

### Misc
  - Migrated workflows from Woodpecker CI to GitHub Actions

### Fixed
  - Vulnerabilities in dependencies
  - Unit tests to use the proper TypeScript implementation

[Show differences](https://github.com/typescript-nameof/nameof/compare/v0.0.10...v0.0.11)

## TypeScript `nameof` v0.0.10
### Fixed
  - Woodpecker pipelines and publishing process

[Show differences](https://github.com/typescript-nameof/nameof/compare/v0.0.9...v0.0.10)

## TypeScript `nameof` v0.0.9
### Fixed
  - An error where expressions such as `!function(){}()` would cause compilations to fail ([#11](https://github.com/typescript-nameof/nameof/issues/11))  
  - Thanks, [@Ixonal](https://github.com/Ixonal) for reporting!
  - Documentation to address the babel configuration properly  
    Thanks, [@philsherry](https://github.com/philsherry) for reporting

### Updated
  - All dependencies
  - Improved performance ([#6](https://github.com/typescript-nameof/nameof/pull/6))  
    Thanks, [@lahma](https://github.com/lahma)!
  - The plugin to skip parsing nodes unnecessarily
  - The `README` file in general

[Show differences](https://github.com/typescript-nameof/nameof/compare/v0.0.7...v0.0.9)

## TypeScript `nameof` v0.0.7
### Fixed
  - The `nameof.typed` function for optional properties
  - Non-functional unit tests

### Updated
  - All dependencies

[Show differences](https://github.com/typescript-nameof/nameof/compare/v0.0.6...v0.0.7)

## TypeScript `nameof` v0.0.6
### Fixed
  - Language service plugin to improve accuracy of error messages

### Updated
  - The `IndexOutOfBoundError` message to show proper bounds
  - Adapter to report errors for malformed, nested `nameof` calls
  - CI configuration to add `.vsix` files to future releases
  - All dependencies

### Removed
  - Unnecessary files from vscode extension

[Show differences](https://github.com/typescript-nameof/nameof/compare/v0.0.5...v0.0.6)

## TypeScript `nameof` v0.0.5
### Fixed
  - Non-functioning vscode extension

### Updated
  - All dependencies

[Show differences](https://github.com/typescript-nameof/nameof/compare/v0.0.4...v0.0.5)

## TypeScript `nameof` v0.0.4
### Added
  - A TypeScript Language Service plugin and a corresponding `vscode` extension to show `nameof()`-related issues in the IDE

### Updated
  - The `README` file to include more reasonable examples

[Show differences](https://github.com/typescript-nameof/nameof/compare/v0.0.3...v0.0.4)

## TypeScript `nameof` v0.0.3
### Added
  - A function `nameof.typed` to get strictly typed key names  
    What, you don't need such a thing!? idc, I do!

    Usage:
    ```ts
    nameof.typed<Console>().warn;
    // or
    nameof.typed(() => process).exit;
    // or
    nameof.typed((module: NodeJS.Module) => module.require).resolve;
    ```

### Updated
  - All dependencies
  - Babel components for streamlining node transformation order

[Show differences](https://github.com/typescript-nameof/nameof/compare/v0.0.2...v0.0.3)

## TypeScript `nameof` v0.0.2
### Fixed
  - Type declaration collision by removing unnecessary dependency
  - Typos in the `README` files

[Show differences](https://github.com/typescript-nameof/nameof/compare/v0.0.1...v0.0.2)

## TypeScript `nameof` v0.0.1
This is it! Words cannot describe how happy I am to be finally done rewriting the infamous, great `ts-nameof` project!
Not only does this release bring TypeScript v5 support but there are also tons of more features waiting for you.

Thanks to everyone who is showing interest in this project!

Let's head right into the...

### Highlights
#### Drop-In Replacement
The type declaration and the API of the TypeScript `nameof` are completely compatible with `ts-nameof`.

If you used to transform your `nameof` calls using the `ts-nameof` project, all you need to do is replace `ts-nameof` and `@types/ts-nameof` with the packages of this project as described in the setup guide in the README.

#### Self-Contained Type Declarations
Up until now, type declarations for `ts-nameof` were hosted by the [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) project. However, this meant that the type declarations had to go through DefinitelyTyped's workflow for them to be updated.

For `@typescript-nameof`, these type declarations are hosted in this very repository and are thus always sure to be up-to-date with their corresponding version.

#### Less Strict Parsing
Previously, the whole expression passed to `nameof` was parsed and would cause errors if some part of the expression was unsupported.

The new `@typescript-nameof` implementations will only throw errors if the part that is necessary to get the (full) name is unsupported.

Following code used to cause errors but is supported now:

```ts
console.log(nameof((13 * 37).toFixed)); // Logs `toFixed`
```

#### One Package For Everything
The number of packages in this project has been minimized. You can now use a single package `@typescript-nameof/babel` both for the plugin-integration and macro-integration for Babel.js.

For all other purposes, all you need to install is `@typescript-nameof/types` and `@typescript-nameof/nameof` according to the setup guide in the README file.

#### Error Reporting
In the latest version of `ts-nameof` TypeScript compilers such as `ts-patch` and `ttypescript` would exit while watching files if an error related to `nameof` calls occurred.

Furthermore, the old implementation would only report the code causing an error without giving a hint on the line- or column number the non-functioning code is located at.

This issue is now fixed for `ts-patch`. Errors are now reported to `ts-patch` and thus displayed in your editor during watched compilations.

So far, `@typescript-nameof` supports error reporting for `ts-patch` and `ts-jest` which are the only ecosystems providing an API for reporting errors. Other ecosystems will print error messages and the corresponding file names, line- and column numbers to the console.

#### Solid Testing
Every tiniest aspect of the `@typescript-nameof` packages are proven to work by tons of unit tests.

#### TypeScript v5 Support
As mentioned before, this plugin now uses up-to-date TypeScript API calls and thus does not spam warnings in your console anymore and further is able to run with TypeScript version 5.

### Thank You 🎉🎉
At this point, I'd like to say thank you to @dsherret and all the contributors of the former `ts-nameof` project: @cecilyth, @G-Rath, @parloti, @Kukks

I'm more than happy to throw my 2 cents into the "TypeScript should have `nameof` support" bucket!

I truly hope this project will be of use for others.

### The Future
As you might be able to see, I'd love this project to be open for contributions.
However, there are a few things I'm not experienced enough in.

If I invite members to this organization, how do I make sure they do not abuse the access to my Woodpecker instance?
How do I enable contributors to trigger the mechanism to publish this project to npmjs.com?

Are there organization-scoped access tokens on npmjs.com?

Is GitHub actions a better solution than a self-hosted Woodpecker CI for a project with other contributors?

I'll sure have to make up my mind on some of these questions.

### Fixed
  - TypeScript v5 Support
  - Error reporting causing watched compilations to exit

### Added
  - `@typescript-eslint/types` package for providing type declarations
  - Error Reporting Support for
    - `ts-patch`
    - `ts-jest`
  - Support for getting the name of keyword types such as:
    - `any`
    - `unknown`
    - `void`
    - `never`
    - `object`
    - `boolean`
    - `number`
    - `bigint`
    - `string`
    - `symbol`
  - A playground for testing the behaviour of the TypeScript `nameof` packages
  - Insane amount of unit tests

### Updated
  - Tests to normalize and format source code for comparing test results
  - Structure to narrow the number of packages
  - Parser to ignore unsupported nodes which are not relevant for the result

### Misc
  - Initial release

[Show differences](https://github.com/typescript-nameof/nameof/compare/5e817b83998d5e3735c2d4dc991c86a9dcffdecd...v0.0.1)
