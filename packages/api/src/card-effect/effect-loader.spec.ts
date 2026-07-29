import { describe, expect, it, jest } from '@jest/globals';
import { buildEffectRegistry } from './effect-loader';
import type {
  EffectSourceBundle,
  SpecialHandlerDefinition,
} from './types/effect-registry';

describe('buildEffectRegistry', () => {
  it('loads edition-based card definitions into a single cardId registry', () => {
    const sources: EffectSourceBundle = {
      definitions: [
        {
          editionId: 'OP01',
          cards: [
            {
              cardId: 'op01-001',
              effects: [
                {
                  kind: 'standard',
                  effect: {
                    id: 'on-play',
                    text: 'Draw 1.',
                    trigger: { type: 'onPlay' },
                    actions: [{ type: 'draw', player: 'self', amount: 1 }],
                  },
                },
              ],
            },
          ],
        },
        {
          editionId: 'OP02',
          cards: [
            {
              cardId: 'OP02-002',
              effects: [
                {
                  kind: 'continuous',
                  effect: {
                    id: 'buff',
                    text: 'Buff.',
                    modifier: {
                      selector: { player: 'self', zones: ['characters'] },
                      power: 1000,
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
      specialHandlers: [],
    };

    const registry = buildEffectRegistry(sources);

    expect(registry.effectsByCardId['OP01-001']?.standard?.[0]?.id).toBe(
      'on-play',
    );
    expect(registry.effectsByCardId['OP02-002']?.continuous?.[0]?.id).toBe(
      'buff',
    );
  });

  it('builds trigger and replacement indexes once at startup', () => {
    const sources: EffectSourceBundle = {
      definitions: [
        {
          editionId: 'OP01',
          cards: [
            {
              cardId: 'OP01-002',
              effects: [
                {
                  kind: 'standard',
                  effect: {
                    id: 'trigger-a',
                    text: 'A',
                    trigger: { type: 'onPlay' },
                    actions: [{ type: 'draw', player: 'self', amount: 1 }],
                  },
                },
                {
                  kind: 'standard',
                  effect: {
                    id: 'trigger-b',
                    text: 'B',
                    trigger: { type: 'trigger' },
                    actions: [{ type: 'draw', player: 'self', amount: 1 }],
                  },
                },
                {
                  kind: 'replacement',
                  effect: {
                    id: 'replace-a',
                    text: 'Replace',
                    event: 'wouldKoCharacter',
                    replacement: [],
                    priority: 2,
                  },
                },
              ],
            },
          ],
        },
      ],
      specialHandlers: [],
    };

    const registry = buildEffectRegistry(sources);

    expect(registry.triggeredEffectsByTrigger.onPlay).toHaveLength(1);
    expect(registry.triggeredEffectsByTrigger.trigger).toHaveLength(1);
    expect(
      registry.replacementEffectsByEventType.wouldKoCharacter,
    ).toHaveLength(1);
  });

  it('registers special handlers by cardId and keeps them separate from normal indexes', () => {
    const handler: SpecialHandlerDefinition = {
      id: 'special-a',
      cardId: 'OP99-001',
      resolve: jest.fn(),
    };
    const sources: EffectSourceBundle = {
      definitions: [
        {
          editionId: 'OP99',
          cards: [
            {
              cardId: 'OP99-001',
              effects: [
                {
                  kind: 'special-ref',
                  specialHandlerId: 'special-a',
                },
              ],
            },
          ],
        },
      ],
      specialHandlers: [handler],
    };

    const registry = buildEffectRegistry(sources);

    expect(registry.specialHandlersByCardId['OP99-001']).toMatchObject({
      id: 'special-a',
      cardId: 'OP99-001',
    });
    expect(registry.specialHandlersByCardId['OP99-001']?.resolve).toBe(
      handler.resolve,
    );
    expect(registry.triggeredEffectsByTrigger.onPlay).toHaveLength(0);
  });

  it('rejects duplicate cardIds across edition files', () => {
    const sources: EffectSourceBundle = {
      definitions: [
        {
          editionId: 'OP01',
          cards: [{ cardId: 'OP01-003' }],
        },
        {
          editionId: 'EB01',
          cards: [{ cardId: 'op01-003' }],
        },
      ],
      specialHandlers: [],
    };

    expect(() => buildEffectRegistry(sources)).toThrow(
      'Duplicate effect definition for card "OP01-003" during effect bootstrap.',
    );
  });
});
