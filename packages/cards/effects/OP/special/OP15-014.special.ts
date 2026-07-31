import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP15-014 "Bartolomeo"
 * If this Character would be K.O.'d, you may trash 1 Event from your hand
 * instead (handled as a replacement effect in op15.effects.ts).
 * [On Play] Activate up to 1 {Dressrosa} type Event with a base cost of 3 or
 * less from your hand.
 */
export const op15014SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-014-special',
  cardId: 'OP15-014',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    engine.chooseCards(
      `${event.sourceInstanceId}:op15-014:select-event`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Bartolomeo] Select a Dressrosa Event with base cost 3 or less to activate:',
      {
        player: 'self',
        zones: ['hand'],
        filter: {
          cardCategory: ['Event'],
          trait: ['Dressrosa'],
          baseCostMax: 3,
        },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (cards) => {
        for (const card of cards) {
          engine.moveCard(card, event.playerSessionId, 'trash');
          const eventEffects =
            engine.effectsByCardId[card.cardId]?.standard ?? [];
          for (const effectDef of eventEffects) {
            engine.queueEffect(
              event.playerSessionId,
              card.instanceId,
              card.cardId,
              effectDef,
            );
          }
        }
        if (cards.length > 0) {
          engine.syncPlayer(event.playerSessionId);
          const opponentId = engine.getOpponentSessionId(event.playerSessionId);
          if (opponentId) engine.syncPlayer(opponentId);
        }
      },
    );
  },
};
