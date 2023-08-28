# TypeScript `nameof`
[![Build Status](https://ci.nuth.ch/api/badges/typescript-nameof/nameof/status.svg)](https://ci.nuth.ch/typescript-nameof/nameof)

A set of tools for allowing the use of `nameof()` calls in various ecosystems.

> ***Note:***  
> This project is based on [@dsherret](https://github.com/dsherret)'s former [`ts-nameof`-project](https://github.com/dsherret/ts-nameof)

The goal of the TypeScript `nameof` project is to allow TypeScript developers to programmatically get the name of their variables, classes, methods, type names and objects.  
The syntax is based on the [`nameof` keyword](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/nameof) in the C# language.

Using this project, you are able to write statements such as the following:

```ts
console.log(nameof(console));           // prints `console`
console.log(nameof(console.log));       // prints `log`
console.log(nameof(console["warn"]));   // prints `warn`
```

## Supported Ecosystems
The TypeScript `nameof` project is supported by many different ecosystems.

Following ecosystems have been tested and are proven to work:

  - `ts-patch` (recommended)
  - `ttypescript`
  - `webpack` (using `ts-loader`)
  - `ts-jest`
  - `babel` (using a plugin or `babel-plugin-macros` alternatively)

The `@typescript-nameof/nameof` package also exposes functions for programmatically replacing `nameof` calls both in code snippets and in files.

To find out more on how to set up TypeScript `nameof`, please head to the [Setup](#compiler-setup) section.

## Features
  - **Easy Compiler Integration:** The `@typescript-nameof/nameof` package provides support for a wide variety of ecosystems out of the box.
  - **Error Reporting:** In ecosystems supporting error reporting (`ts-patch` and `ts-jest`), rich error reporting experience is provided. For other ecosystems, errors including file names and locations of errors are printed to the console.
  - **Keyword Type Support:** Getting the name of keyword types such as `any`, `string`, `number` etc. is supported

## Packages
This project consists of multiple packages.
This section provides a brief explanation as to what functionalities are covered by the packages.

  - [`@typescript-nameof/nameof`](./packages/nameof):  
    Provides plugins and transformers for a majority of TypeScript ecosystems. The code which is used for parsing and manipulating the TypeScript AST can be found here.
  - [`@typescript-nameof/types`](./packages/types):  
    Contains the type declaration of the global `nameof` function
  - [`@typescript-nameof/common`](./packages/common):  
    Holds core components which are used for both the Babel.js and the TypeScript integrations. Components for detecting, interpreting and transforming `nameof` calls can be found here.
  - [`@typescript-nameof/babel`](./packages/babel):  
    Provides a plugin to use with the Babel.js compiler. This package contains the logic for parsing and manipulating Babel.js AST. This package also provides a macro for the use with `babel-plugin-macros`.
  - [`@typescript-nameof/common-types`](./packages/common-types):  
    Exposes common type declarations which are used by all packages
  - [`@typescript-nameof/test`](./packages/test):  
    Holds unit components which are used for testing whether the `nameof` integrations work properly.
  - [`@typescript-nameof/playground`](./packages/playground):  
    Contains a few example projects for trying out `nameof`-integrations

## Table of Contents
- [TypeScript `nameof`](#typescript-nameof)
  - [Supported Ecosystems](#supported-ecosystems)
  - [Features](#features)
  - [Packages](#packages)
  - [Table of Contents](#table-of-contents)
  - [Syntax](#syntax)
    - [`nameof`](#nameof)
    - [`nameof.full`](#nameoffull)
    - [`nameof.interpolate`](#nameofinterpolate)
    - [`nameof.array`](#nameofarray)
    - [`nameof.split`](#nameofsplit)
  - [Supported Expressions](#supported-expressions)
  - [Compiler Setup](#compiler-setup)
    - [Set Up a Project](#set-up-a-project)
    - [Install Type Declarations](#install-type-declarations)
    - [Install TypeScript `nameof` Integration](#install-typescript-nameof-integration)
    - [Configure Compiler to Use TypeScript `nameof`](#configure-compiler-to-use-typescript-nameof)
      - [`ts-patch` and `ttypescript`](#ts-patch-and-ttypescript)
      - [`webpack` (using `ts-loader`)](#webpack-using-ts-loader)
      - [`ts-jest`](#ts-jest)
    - [`babel` Using a Plugin](#babel-using-a-plugin)
    - [`babel` Using a Macro](#babel-using-a-macro)
  - [Thank You!](#thank-you)

## Syntax
TypeScript `nameof` provides a wide variety of functions. The core concept is that the user passes an expression (such as a parameter, a type parameter or a lambda) and gets the expression's name in the desired format as a result.

Please take note, that the format of `nameof`-calls is very strict as the content of `nameof` calls are parsed and transformed using this project.

In the following section, all functions are briefly described.

### `nameof`
The `nameof` function allows you to retrieve the last part of a name of a variable, a property or a type as a `string`.

```ts
let x: string;
interface ITest { prop: number }
console.log(nameof(x));                         // Prints `x`
console.log(nameof(console));                   // Prints `console`
console.log(nameof(/.*/.test));                 // Prints `test`
console.log(nameof<void>());                    // Prints `void`
console.log(nameof<ITest>());                   // Prints `ITest`
console.log(nameof<ITest>((x) => x.prop));      // Prints `prop`
console.log(nameof<ITest>((x) => x["prop"]));   // Prints `prop`
```

### `nameof.full`
Unlike `nameof()` calls, the `nameof.full` call allows you to print the full name of an expression as a `string`:

```ts
let x: string;
namespace Test { interface ITest { prop: number } }
console.log(nameof.full(x.toString));                        // Prints `x.toString`
console.log(nameof.full(console["log"]));                    // Prints `console["log"]`
console.log(nameof.full(console['log']));                    // Prints `console["log"]`, too
console.log(nameof.full(console["log"].bind));               // Prints `console["log"].bind`
console.log(nameof.full<Test.ITest>((x) => x.["prop"]));     // Prints `["prop"]`
console.log(nameof.full<Test.ITest>((x) => x.prop.toFixed)); // Prints `prop.toFixed`
console.log(nameof.full<Test.ITest>((x) => console.log));    // Prints `console.log`
console.log(nameof.full<Test.ITest>());                      // Prints `Test.ITest`
```

You can also pass a number indicating the index of the first name part to return.
By passing a negative number, you can fetch the last _`n`_ parts of the full name.

```ts
console.log(nameof.full(console.log));           // Prints `console.log`
console.log(nameof.full(console.log, 1));        // Prints `log`
console.log(nameof.full(console.log.bind, 1));   // Prints `log.bind`
console.log(nameof.full(console.log.bind, -1));  // Prints `bind`
```

> ***Note:***  
> Please take note, that **only numbers** are supported.
> Passing a variable or a calculation instead of a plain number won't work.

### `nameof.interpolate`
`nameof.full` does not support the inclusion of variables in full names.

Thus, expressions such as `nameof.full(tokens[i].content)` result with an error.

However, `nameof.interpolate` got this covered. `nameof.interpolate` calls accept any input and embed it in the result of `nameof.full`.

TypeScript `nameof` will transform this code, for example:
```ts
nameof.full(tokens[i].content);
nameof.full(tokens[2 * 7 - 3].content);
```

To this:
```ts
`tokens[${i}].content`;
`tokens[${2 * 7 - 3}].content`;
```

### `nameof.array`

Originally contributed by [@cecilyth](https://github/cecilyth)

`nameof.array` accepts an array of expressions or a lambda which returns an array of expressions and returns the expression names as a `string[]` array.

> ***Note:***  
> You can also nest `nameof` and `nameof.full`-calls in the `nameof.array`-call.

The code:
```ts
let myObject: any, otherObject: any;
nameof.array(myObject, nameof<void>(), otherObject);
nameof.array(myObject.prop, nameof.full(otherObject.test));
nameof.array<RegExp>((x) => [x.test, nameof.full(x.test)]);
```

Transforms to the following:
```ts
["myObject", "void", "otherObject"];
["prop", "otherObject.test"];
["test", "x.test"];
```

### `nameof.split`

Originally contributed by [@cecilyth](https://github/cecilyth)

The `nameof.split` function is almost equivalent to `nameof.full`. However, instead of returning a `string`, the full name is split into parts and returned as an array:

The code:
```ts
let myObj: any;
namespace Test { interface ITest { } }
nameof.split(console.log.bind);
nameof.split(tokens[0].content);
nameof.split(console.log.bind, 1);
nameof.split(console.log.bind, -1);
nameof.split(console.log.bind).join("/");
nameof.split<Test.ITest>();
```

Transforms to:
```ts
["console", "log", "bind"];
["tokens", "0", "content"];
["log", "bind"];
["bind"];
["console", "log", "bind"].join("/");
["Test", "ITest"]
```

## Supported Expressions
The Typescript `nameof` plugins are limited in what kind of expressions they are able to understand.  
This section contains a brief list of expressions which are supported:

  - `PropertyAccessExpression`s:
    ```ts
    nameof(obj.property)
    ```
  - Numeric and string `ElementAccessExpression`s:
    ```ts
    nameof(obj[0])
    nameof(obj["property"])
    ```
  - Functions and lambdas:
    ```ts
    nameof<RegExp>((x) => x.test)
    nameof<RegExp>(function (x) { return x.test })
    ```
  - Type Names
    ```ts
    nameof<RegExp>()
    ```
  - Keywords
    ```ts
    nameof(this)
    nameof<never>()
    ```
    TypeScript `nameof` supports these keywords:
    - `this`
    - `super`
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

Feel free to open up an issue if you think something is missing.

## Compiler Setup
In this section, you can find out how to set up TypeScript `nameof` for your corresponding ecosystem. Stick to these steps and you are ready to go!

### Set Up a Project
This guide assumes that you have set up a project for the ecosystem of your choice.

If you aren't sure how to configure your ecosystem properly, you might want to have a look at the [`playground` folder](./packages/playground) which already contains configuration files for many different ecosystems.

### Install Type Declarations
This step is not necessary if you plan to run TypeScript `nameof` using a `babel-plugin-macros`.

You can install the type declarations which expose the `nameof` function using the following command:

```sh
npm install --save-dev @types/nameof@npm:@typescript-nameof/types
```

This will install `@typescript-nameof/types` and store it as if it were named `@types/nameof`.

You can, of course, use any package name in place of `@types/nameof` (such as `@types/bogus`) as long as it starts with the `@types/`-prefix, as these packages will be picked by TypeScript automatically without having to `import` or `require` them somewhere in your code.

### Install TypeScript `nameof` Integration
Next, you need to install the corresponding integration of TypeScript `nameof`.

Please run the following to install the integration in your project:
  - For `ts-patch`, `ttypescript`, `ts-jest`, `webpack` (using `ts-loader`) and other ecosystems which support TypeScript `TransformerFactory`s:
    ```sh
    npm install --save-dev @typescript-nameof/nameof
    ```
  - For `babel` (using a plugin):
    ```sh
    npm install --save-dev @typescript-nameof/babel
    ```
  - For `babel` (using a macro and `babel-plugin-macros`):
    ```sh
    npm install --save-dev babel-plugin-macros @typescript-nameof/babel
    ```

### Configure Compiler to Use TypeScript `nameof`
Lastly, you need to configure your compiler to pick up the plugin.

#### `ts-patch` and `ttypescript`
Add the following plugin configuration to your project's `tsconfig` file:

***tsconfig.json:***
```json
{
    "compilerOptions": {
        "plugins": [
            {
                "transform": "@typescript-nameof/nameof"
            }
        ]
    }
}
```

#### `webpack` (using `ts-loader`)
Add `@typescript-nameof/nameof` to the custom transformers in your `ts-loader` options:


***webpack.config.js:***
```js
module.exports = {
    // [...]
    module: {
        rules: [
            {
                test: /\.([cm]?ts|tsx)$/,
                loader: "ts-loader",
                options: {
                    getCustomTransformers: () =>
                    {
                        return {
                            before: [
                                require("@typescript-nameof/nameof")
                            ]
                        }
                    }
                }
            }
        ]
    }
}
```

#### `ts-jest`
Use the following code snippet in your `jest` configuration file in order to enable `nameof` support:

***jest.config.js:***
```js
module.exports = {
    // [...]
    transform: {
        "^.+\\.([cm]?ts|tsx)$": [
            "ts-jest",
            {
                astTransformers: {
                    before: [
                        "@typescript-nameof/nameof"
                    ]
                }
            }
        ]
    }
}
```

### `babel` Using a Plugin
In order to use TypeScript `nameof`'s Babel.js plugin, add the following to your configuration:

***babel.config.js:***
```js
module.exports = {
    // [...]
    plugins: [
        "@typescript-nameof/babel"
    ]
};
```

### `babel` Using a Macro
In order to use the Babel.js macro, you need to set up `babel-plugin-macros` properly.
Please head to the project page to find out how to do so:

https://github.com/kentcdodds/babel-plugin-macros#readme

After doing so, you can access `nameof` by importing the `@typescript-nameof/babel/macro` module:

```ts
import nameof from "@typescript-nameof/babel/macro";

nameof(console.log);
```

## Thank You!
At this point, I'd like to express my deepest gratitude to the former maintainer [@dsherret](https://github.com/dsherret) for the great work. I've been using `ts-nameof` for years in all my projects. Which is one of the major reasons why I decided to create and maintain my own version of this project.

Furthermore, I'd like to thank each of the other contributors of `ts-nameof`, namely:
  - [@cecilyth](https://github.com/cecilyth)
  - [@G-Rath](https://github.com/G-Rath)
  - [@parloti](https://github.com/parloti)
  - [@Kukks](https://github.com/Kukks)

Without your work this reboot couldn't exist!
