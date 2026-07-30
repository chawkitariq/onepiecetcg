/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP10-110
 * [On Play] Rest up to 1 of your opponent's Characters with a cost less
 * than or equal to the number of your opponent's Life cards.
 * [Trigger] If you have 2 or less Life cards, you may play this card
 * from your hand.
 */
export const op10110SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-110-special',
  cardId: 'OP10-110',
  resolve(event, engine) {
    if (event.type === 'onPlay') {
      const anyEngine = engine as any;
      const host = anyEngine.host;
      const decisions = anyEngine.decisions;
      const player = host.getPlayer(event.playerSessionId);
      if (!player) return;
      const opponentSessionId = host.getOpponentSessionId(
        event.playerSessionId,
      );
      if (!opponentSessionId) return;
      const opponent = host.getPlayer(opponentSessionId);
      if (!opponent) return;
      const oppLifeCount = opponent.zones.life.length;
      decisions.chooseCards(
        `${event.sourceInstanceId}:op10-110:rest-char`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        `Rest 1 opponent Character with cost <= ${oppLifeCount}:`,
        {
          player: 'opponent',
          zones: ['characters'],
          filter: { cardCategory: ['Character'], costMax: oppLifeCount },
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        (cards) => {
          for (const card of cards) {
            host.restCard(card);
          }
          engine.reapplyContinuousEffects();
        },
      );
    } else if (event.type === 'trigger') {
      const anyEngine = engine as any;
      const host = anyEngine.host;
      const player = host.getPlayer(event.playerSessionId);
      if (!player) return;
      if (player.zones.life.length > 2) return;
      const source = host.getCard(event.sourceInstanceId);
      if (!source) return;
      host.moveCard(source, event.playerSessionId, 'characters');
      host.syncPlayer(event.playerSessionId);
      engine.reapplyContinuousEffects();
    }
  },
};
