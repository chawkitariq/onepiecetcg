import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

export const op04048SpecialHandler: SpecialHandlerDefinition = {
  id: 'op04-048-special',
  cardId: 'OP04-048',
  resolve(event, engine) {
    if (event.type !== 'onPlay') {
      return;
    }

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);

    if (!player) {
      return;
    }

    const returnedCards = Array.from(player.zones.hand);
    const returnedCount = returnedCards.length;

    for (const card of returnedCards) {
      host.moveCard(card, event.playerSessionId, 'deck');
    }

    host.shuffleDeck(event.playerSessionId);

    for (let index = 0; index < returnedCount; index += 1) {
      host.drawCard(event.playerSessionId);
    }

    host.syncPlayer(event.playerSessionId);
  },
};
