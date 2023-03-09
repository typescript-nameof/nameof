# Using ts-nameof with Jest

1. Setup jest with [ts-jest](https://github.com/kulshekhar/ts-jest)

2. `npm install --save-dev @typescript-nameof/nameof`

3. Install the type declarations:  
   `npm install --save-dev @types/nameof@npm:@typescript-nameof/types`

5. In _package.json_ specify...

```jsonc
{
    // ...
    "jest": {
        "globals": {
            "ts-jest": {
                "astTransformers": ["@typescript-nameof/nameof"]
            }
        }
    }
}
```

...or in _jest.config.js_...

```ts
module.exports = {
    // ...
    globals: {
        "ts-jest": {
            "astTransformers": ["@typescript-nameof/nameof"],
        },
    },
};
```
