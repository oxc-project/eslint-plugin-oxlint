import * as ruleMaps from "./rules-by-scope.js";

// merge objects into one array
const rules = Object.values(ruleMaps).reduce(
  (accumulator, object) => Object.assign(accumulator, object),
  {},
);

export default {
  configs: {
    recommended: {
      plugins: ["oxlint"],
      rules,
    },
    "flat/recommended": {
      rules,
    },
  },
};
