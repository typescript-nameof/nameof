// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("../package.json");

/**
 * The version of the plugin.
 */
export const version = pkg["version"] as string;
