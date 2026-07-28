import { describe, expect, it, jest } from '@jest/globals';
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
          standards: [
            {
              kind: 'standard',
              effect: {
                id: 'generated-standard',
                text: 'Generated',
                trigger: { type: 'onPlay' },
                actions: [{ type: 'draw', player: 'self', amount: 1 }],
              },
            },
          ],
          continuous: [
            {
              kind: 'continuous',
              effect: {
                id: 'generated-continuous',
                text: 'Generated continuous',
                modifier: {
                  selector: { player: 'self', zones: ['characters'] },
                  power: 1000,
                },
              },
            },
          ],
        },
      ],
      overrides: [
        {
          cardId: 'OP01-001',
          standards: [
            {
              kind: 'standard',
              effect: {
                id: 'manual-standard',
                text: 'Manual',
                trigger: { type: 'whenAttacking' },
                actions: [{ type: 'draw', player: 'self', amount: 2 }],
              },
            },
          ],
        },
      ],
      replacementPrimitives: [],
      continuousPrimitives: [],
      specialHandlers: [],
    };

    const registry = buildEffectRegistry(sources);
    const definition = registry.effectsByCardId['OP01-001'];

    expect(definition.standard?.map((effect) => effect.id)).toEqual([
      'manual-standard',
    ]);
    expect(definition.continuous).toBeUndefined();
  });

  it('builds trigger and replacement indexes once at startup', () => {
    const sources: EffectSourceBundle = {
      generated: [
        {
          cardId: 'OP01-002',
          standards: [
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
          ],
          replacements: [
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
      overrides: [],
      replacementPrimitives: [],
      continuousPrimitives: [],
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
      generated: [{ cardId: 'OP99-001' }],
      overrides: [],
      replacementPrimitives: [],
      continuousPrimitives: [],
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

  it('resolves replacement and continuous primitive references during bootstrap', () => {
    const sources: EffectSourceBundle = {
      generated: [
        {
          cardId: 'OP01-003',
          replacements: [
            {
              kind: 'replacement-ref',
              primitiveId: 'replace-a',
            },
          ],
          continuous: [
            {
              kind: 'continuous-ref',
              primitiveId: 'continuous-a',
            },
          ],
        },
      ],
      overrides: [],
      replacementPrimitives: [
        {
          id: 'replace-a',
          effect: {
            id: 'replace-a',
            text: 'Replace',
            event: 'wouldKoCharacter',
            replacement: [],
          },
        },
      ],
      continuousPrimitives: [
        {
          id: 'continuous-a',
          effect: {
            id: 'continuous-a',
            text: 'Continuous',
            modifier: {
              selector: { player: 'self', zones: ['characters'] },
              power: 1000,
            },
          },
        },
      ],
      specialHandlers: [],
    };

    const registry = buildEffectRegistry(sources);

    expect(registry.effectsByCardId['OP01-003']?.replacements?.[0]?.id).toBe(
      'replace-a',
    );
    expect(registry.effectsByCardId['OP01-003']?.continuous?.[0]?.id).toBe(
      'continuous-a',
    );
    expect(registry.replacementPrimitivesById['replace-a']).toBeDefined();
    expect(registry.continuousPrimitivesById['continuous-a']).toBeDefined();
  });
});
