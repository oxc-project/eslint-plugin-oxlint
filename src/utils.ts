import { kebabCase } from 'scule';
import type { KebabCase } from 'scule';

type WithoutRulesSuffix<T> = T extends `${infer P}Rules` ? P : never;

export function createFlatRulesConfig<
  InputConfigs extends Record<string, RuleRecord>,
  RuleRecord extends Record<string, string>,
  ConfigNameVariable extends keyof InputConfigs,
  ConfigName extends WithoutRulesSuffix<ConfigNameVariable>,
  OutputConfigs extends Record<
    `flat/${KebabCase<ConfigName>}`,
    {
      name: string;
      rules: RuleRecord;
    }
  >,
>(rulesModule: InputConfigs): OutputConfigs {
  const flatRulesConfig = {} as OutputConfigs;

  // Iterate over each property in the rules module
  for (const key of Object.keys(rulesModule)) {
    if (key.endsWith('Rules')) {
      // Ensure the property is a rules set
      const ruleName = kebabCase(key.replace('Rules', ''));
      const flatKey = `flat/${ruleName}` as `flat/${KebabCase<ConfigName>}`; // Create the new key

      // @ts-ignore TS2322 -- "could be instantiated with a different subtype of constraint".
      // we do not care at the moment, we only want our index.d.ts to include the names of the config
      flatRulesConfig[flatKey] = {
        name: `oxlint/${ruleName}`,
        rules: rulesModule[key],
      }; // Assign the rules to the new key
    }
  }

  return flatRulesConfig;
}
