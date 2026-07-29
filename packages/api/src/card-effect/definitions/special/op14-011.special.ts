/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP14-011 Bartolomeo
 * [DON!! x2] This Character gains [Blocker].
 */
export const op14011SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-011-special',
  cardId: 'OP14-011',
  resolve(event, engine) {
    if (event.type !== 'onPlay' && event.type !== 'onDonAttached') return;
    const anyEngine = engine as any;
    const { host } = anyEngine;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;
    if (source.attachedDon >= 2) {
      anyEngine.modifiers.addKeywordModifier(
        event.sourceInstanceId,
        event.playerSessionId,
        event.sourceInstanceId,
        ['cannotBlock'],
        'whileSourceInPlay',
      );
    }
    engine.reapplyContinuousEffects();
  },
};
