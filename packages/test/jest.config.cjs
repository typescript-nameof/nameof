module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    ".ts$": [
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
