import { describe, expect, it } from 'vitest';
import {
  effectDefinitionEditions,
  loadEffectSources,
  specialHandlerDefinitions,
} from './index';

describe('@onepiecetcg/cards', () => {
  it('exposes the packaged effect definitions and special handlers', () => {
    const sources = loadEffectSources();

    expect(effectDefinitionEditions.length).toBeGreaterThan(0);
    expect(specialHandlerDefinitions.length).toBeGreaterThan(0);
    expect(
      effectDefinitionEditions.some((edition) => edition.editionId === 'OP-01'),
    ).toBe(true);
    expect(sources.definitions).toBe(effectDefinitionEditions);
    expect(sources.specialHandlers).toBe(specialHandlerDefinitions);
  });
});
