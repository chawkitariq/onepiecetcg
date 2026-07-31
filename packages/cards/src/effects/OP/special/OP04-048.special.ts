import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

export const op04048SpecialHandler: SpecialHandlerDefinition = {
  id: 'op04-048-special',
  cardId: 'OP04-048',
  resolve(event, engine) {
    if (event.type !== 'onPlay') {
      return;
    }

    const player = engine.getPlayer(event.playerSessionId);

    if (!player) {
      return;
    }

    const returnedCards = Array.from(player.zones.hand);
    const returnedCount = returnedCards.length;

    for (const card of returnedCards) {
      engine.moveCard(card, event.playerSessionId, 'deck');
    }

    engine.shuffleDeck(event.playerSessionId);

    for (let index = 0; index < returnedCount; index += 1) {
      engine.drawCard(event.playerSessionId);
    }

    engine.syncPlayer(event.playerSessionId);
  },
};
