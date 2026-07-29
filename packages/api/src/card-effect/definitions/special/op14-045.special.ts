/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP14-045 Kuroobi
 * When a card is trashed from your hand by an effect, this Character gains
 * [Rush] during this turn.
 * [On K.O.] Draw 1 card.
 */
export const op14045SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-045-special',
  cardId: 'OP14-045',
  resolve(event, engine) {
    if (event.type === 'onKo') {
      const anyEngine = engine as any;
      const { host } = anyEngine;
      host.drawCard(event.playerSessionId);
      host.syncPlayer(event.playerSessionId);
      engine.reapplyContinuousEffects();
    } else if (event.type === 'onCardDrawn') {
      const anyEngine = engine as any;
      const { host } = anyEngine;
      const source = host.getCard(event.sourceInstanceId);
      if (!source) return;
      anyEngine.modifiers.addKeywordModifier(
        event.sourceInstanceId,
        event.playerSessionId,
        event.sourceInstanceId,
        ['rush'],
        'untilEndOfTurn',
      );
      engine.reapplyContinuousEffects();
    }
  },
};
