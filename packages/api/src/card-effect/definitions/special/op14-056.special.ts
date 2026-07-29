/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP14-056 Wadatsumi
 * This Character cannot attack.
 * When a card is trashed from your hand by an effect, this Character's effect
 * is negated during this turn.
 */
export const op14056SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-056-special',
  cardId: 'OP14-056',
  resolve(event, engine) {
    if (event.type === 'onPlay') {
      const anyEngine = engine as any;
      anyEngine.modifiers.addKeywordModifier(
        event.sourceInstanceId,
        event.playerSessionId,
        event.sourceInstanceId,
        ['cannotAttack'],
        'whileSourceInPlay',
      );
      engine.reapplyContinuousEffects();
    } else if (event.type === 'onCardDrawn') {
      const anyEngine = engine as any;
      const { host } = anyEngine;
      const source = host.getCard(event.sourceInstanceId);
      if (!source) return;
      source.cannotAttack = false;
      host.syncPlayer(event.playerSessionId);
      engine.reapplyContinuousEffects();
    }
  },
};
