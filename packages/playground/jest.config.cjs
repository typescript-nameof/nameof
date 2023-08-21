module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testRegex: "/test/[^/]*\\.(test|spec)\\.ts",
  transform: {
    "\\.ts$": [
      "ts-jest",
      {
        astTransformers: {
          before: [
            // eslint-disable-next-line node/no-unpublished-require
            require.resolve("../nameof")
          ]
        }
      }
    ]
  }
};
