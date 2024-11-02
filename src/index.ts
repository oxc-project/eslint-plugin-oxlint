import * as ruleMapsByScope from './rules-by-scope.js';
import * as ruleMapsByCategory from './rules-by-category.js';
import configByScope from './configs-by-scope.js';
import configByCategory from './configs-by-category.js';

export {
  buildFromOxlintConfig,
  buildFromOxlintConfigFile,
} from './build-from-oxlint-config.js';

type UnionToIntersection<U> = (
  U extends unknown ? (x: U) => void : never
) extends (x: infer I) => void
  ? I
  : never;

type RulesGroups = keyof typeof ruleMapsByScope;
type AllRules = (typeof ruleMapsByScope)[RulesGroups];

const allRules: UnionToIntersection<AllRules> = Object.assign(
  {},
  ...Object.values(ruleMapsByScope)
);

export default {
  configs: {
    recommended: {
      plugins: ['oxlint'],
      rules: ruleMapsByCategory.correctnessRules,
    },
    all: {
      plugins: ['oxlint'],
      rules: allRules,
    },
    'flat/all': {
      name: 'oxlint/all',
      rules: allRules,
    },
    'flat/recommended': {
      name: 'oxlint/recommended',
      rules: ruleMapsByCategory.correctnessRules,
    },
    ...configByScope,
    ...configByCategory,
  },
};
