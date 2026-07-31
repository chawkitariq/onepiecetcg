import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils.js';

export const op06074SpecialHandler: SpecialHandlerDefinition = {
  id: 'op06-074-special',
  cardId: 'OP06-074',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;

    const don = engine.getCards(
      { player: 'self', zones: ['cost'] },
      event.playerSessionId,
    );
    if (don.length < 1) return;
    engine.returnDonToDonDeck(event.playerSessionId, 1);

    engine.chooseCards(
      `${event.sourceInstanceId}:op06-074:negate`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      "Choose up to 1 of your opponent's Characters to negate:",
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'] },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (cards) => {
        for (const card of cards) {
          patchSpecialHandlerCardStatus(engine, card, {
            effectNegated: true,
          });
          engine.syncPlayer(card.ownerSessionId);

          if ((card.power ?? 0) <= 5000) {
            engine.moveCard(card, event.playerSessionId, 'trash');
          }
        }
        engine.reapplyContinuousEffects();
      },
    );
  },
};
