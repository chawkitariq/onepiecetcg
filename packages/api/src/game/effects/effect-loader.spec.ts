import { describe, expect, it, jest } from '@jest/globals';
import type { CardEffectDefinition } from '@onepiecetcg/shared';
import { buildEffectRegistry } from './effect-loader';
import type {
  EffectSourceBundle,
  SpecialHandlerDefinition,
} from './types/effect-registry';

describe('buildEffectRegistry', () => {
  it('merges generated and manual definitions by cardId with manual section precedence', () => {
    const sources: EffectSourceBundle = {
      generated: [
        {
          cardId: 'op01-001',
          standard: [
            {
              id: 'generated-standard',
              text: 'Generated',
              trigger: { type: 'onPlay' },
              actions: [{ type: 'draw', player: 'self', amount: 1 }],
            },
          ],
          continuous: [
            {
              id: 'generated-continuous',
              text: 'Generated continuous',
              modifier: {
                selector: { player: 'self', zones: ['characters'] },
                power: 1000,
              },
            },
          ],
        },
      ],
      manual: [
        {
          cardId: 'OP01-001',
          standard: [
            {
              id: 'manual-standard',
              text: 'Manual',
              trigger: { type: 'whenAttacking' },
              actions: [{ type: 'draw', player: 'self', amount: 2 }],
            },
          ],
        },
      ],
      specialHandlers: [],
    };

    const registry = buildEffectRegistry(sources);
    const definition = registry.effectsByCardId['OP01-001'];

    expect(definition.standard?.map((effect) => effect.id)).toEqual([
      'manual-standard',
    ]);
    expect(definition.continuous?.map((effect) => effect.id)).toEqual([
      'generated-continuous',
    ]);
  });

  it('builds trigger and replacement indexes once at startup', () => {
    const sources: EffectSourceBundle = {
      generated: [
        {
          cardId: 'OP01-002',
          standard: [
            {
              id: 'trigger-a',
              text: 'A',
              trigger: { type: 'onPlay' },
              actions: [{ type: 'draw', player: 'self', amount: 1 }],
            },
            {
              id: 'trigger-b',
              text: 'B',
              trigger: { type: 'trigger' },
              actions: [{ type: 'draw', player: 'self', amount: 1 }],
            },
          ],
          replacements: [
            {
              id: 'replace-a',
              text: 'Replace',
              event: 'wouldKoCharacter',
              replacement: [],
              priority: 2,
            },
          ],
        },
      ],
      manual: [],
      specialHandlers: [],
    };

    const registry = buildEffectRegistry(sources);

    expect(registry.triggeredEffectsByTrigger.onPlay).toHaveLength(1);
    expect(registry.triggeredEffectsByTrigger.trigger).toHaveLength(1);
    expect(registry.replacementEffectsByEventType.wouldKoCharacter).toHaveLength(
      1,
    );
  });

  it('registers special handlers by cardId and keeps them separate from normal indexes', () => {
    const handler: SpecialHandlerDefinition = {
      id: 'special-a',
      cardId: 'OP99-001',
      resolve: jest.fn(),
    };
    const sources: EffectSourceBundle = {
      generated: [{ cardId: 'OP99-001' } as CardEffectDefinition],
      manual: [],
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
});
