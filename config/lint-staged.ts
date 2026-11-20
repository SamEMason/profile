import type { Configuration } from "lint-staged";

const config: Configuration = {
  "*.{js,mjs,cjs,ts,tsx,mts,cts}": [
    "eslint --fix --no-warn-ignored",
    "prettier --write --ignore-unknown",
  ],
  "*.{json,md,css,yml,yaml}": "prettier --write --ignore-unknown",
};

export default config;
