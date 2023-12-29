import * as ruleMaps from './rules.js'

// merge objects into one array

// eslint-disable-next-line unicorn/no-array-reduce
const rules = Object.values(ruleMaps).reduce((accumulator, object) => ({ ...accumulator, ...object }), {})
console.log(rules)

export default {
  rules,
};