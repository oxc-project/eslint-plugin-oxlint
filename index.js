import { deepscanRules, importRules, eslintRules, typescriptRules} from './rules.js'

export default {
  rules: {
   ...deepscanRules, 
   ...importRules,
   ...eslintRules,
   ...typescriptRules
  }
};