import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

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
      const player = engine.getPlayer(event.playerSessionId);
      if (!player) return;
      const opponentSessionId = engine.getOpponentSessionId(
        event.playerSessionId,
      );
      if (!opponentSessionId) return;
      const opponent = engine.getPlayer(opponentSessionId);
      if (!opponent) return;
      const oppLifeCount = opponent.zones.life.length;
      engine.chooseCards(
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
            engine.patchCardStatus(card.instanceId, { rested: true });
          }
          engine.reapplyContinuousEffects();
        },
      );
    } else if (event.type === 'trigger') {
      const player = engine.getPlayer(event.playerSessionId);
      if (!player) return;
      if (player.zones.life.length > 2) return;
      const source = engine.getCard(event.sourceInstanceId);
      if (!source) return;
      engine.moveCard(source, event.playerSessionId, 'characters');
      engine.syncPlayer(event.playerSessionId);
      engine.reapplyContinuousEffects();
    }
  },
};
