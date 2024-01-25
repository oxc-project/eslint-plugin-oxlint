const ruleMaps = require("./rules.cjs");

// merge objects into one array
const rules = Object.values(ruleMaps).reduce((accumulator, object) => ({
  ...accumulator,
  ...object,
}));

module.exports = {
  rules,
  configs: {
    recommended: {
      plugins: ["oxlint"],
      rules,
    },
  },
};
