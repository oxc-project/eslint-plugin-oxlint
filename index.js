import * as ruleMaps from "./rules.js";

// merge objects into one array
const rules = Object.values(ruleMaps).reduce((accumulator, object) => ({
  ...accumulator,
  ...object,
}));

export default {
  rules,
  configs: {
    recommended: {
      plugins: ["oxlint"],
      rules,
    },
  },
};
