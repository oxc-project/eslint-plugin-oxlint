const ruleMaps = require("./rules.cjs");

// merge objects into one array
const rules = Object.values(ruleMaps).reduce(
  (accumulator, object) => Object.assign(accumulator, object),
  {},
);

module.exports = {
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
