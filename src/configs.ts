import * as ruleMapsByScope from './generated/rules-by-scope.js';
import * as ruleMapsByCategory from './generated/rules-by-category.js';
import configByScope from './generated/configs-by-scope.js';
import configByCategory from './generated/configs-by-category.js';
import {
  filterTypeAwareRules,
  overrideDisabledRulesForVueAndSvelteFiles,
  splitDisabledRulesForVueAndSvelteFiles,
  splitDisabledRulesForVueAndSvelteFilesDeep,
} from './config-helper.js';

type UnionToIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (
  x: infer I
) => void
  ? I
  : never;

type RulesGroups = keyof typeof ruleMapsByScope;
type AllRules = (typeof ruleMapsByScope)[RulesGroups];

const allRulesIncludingNursery: UnionToIntersection<AllRules> = Object.assign(
  {},
  ...Object.values(ruleMapsByScope)
);

// Exclude nursery rules from the default 'all' config
const allRules = Object.fromEntries(
  Object.entries(allRulesIncludingNursery).filter(
    ([ruleName]) => !(ruleName in ruleMapsByCategory.nurseryRules)
  )
) as UnionToIntersection<AllRules>;

// Filter type-aware rules from pre-built configs
// Note: buildFromOxlintConfig uses configByCategory/configByScope directly,
// so we only filter here in the exported configs
const filteredConfigByScope = Object.fromEntries(
  Object.entries(configByScope).map(([key, config]) => [
    key,
    { ...config, rules: filterTypeAwareRules(config.rules) },
  ])
);

const filteredConfigByCategory = Object.fromEntries(
  Object.entries(configByCategory).map(([key, config]) => [
    key,
    { ...config, rules: filterTypeAwareRules(config.rules) },
  ])
);

export default {
  recommended: overrideDisabledRulesForVueAndSvelteFiles({
    plugins: ['oxlint'],
    rules: filterTypeAwareRules(ruleMapsByCategory.correctnessRules),
  }),
  all: overrideDisabledRulesForVueAndSvelteFiles({
    plugins: ['oxlint'],
    rules: filterTypeAwareRules(allRules),
  }),
  'flat/all': splitDisabledRulesForVueAndSvelteFiles({
    name: 'oxlint/all',
    rules: filterTypeAwareRules(allRules),
  }),
  'flat/recommended': splitDisabledRulesForVueAndSvelteFiles({
    name: 'oxlint/recommended',
    rules: filterTypeAwareRules(ruleMapsByCategory.correctnessRules),
  }),
  ...splitDisabledRulesForVueAndSvelteFilesDeep(filteredConfigByScope),
  ...splitDisabledRulesForVueAndSvelteFilesDeep(filteredConfigByCategory),
} as const;
