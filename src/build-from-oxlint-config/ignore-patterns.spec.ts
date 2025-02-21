import { describe, expect, it } from 'vitest';
import { handleIgnorePatternsScope } from './ignore-patterns.js';

describe('ignorePattern handleIgnorePatternsScope', () => {
  it('should append ignorePatterns to eslint v9 ignore property', () => {
    const config = {};
    handleIgnorePatternsScope(['./tests/.*ts'], config);

    // @ts-expect-error -- ignores does not exists
    expect(config.ignores).toStrictEqual(['./tests/.*ts']);
  });
});
