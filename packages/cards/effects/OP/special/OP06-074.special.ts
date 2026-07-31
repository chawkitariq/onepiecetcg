import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils.js';

export const op06074SpecialHandler: SpecialHandlerDefinition = {
  id: 'op06-074-special',
  cardId: 'OP06-074',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    const don = host.getCards(
      { player: 'self', zones: ['cost'] },
      event.playerSessionId,
    );
    if (don.length < 1) return;
    host.returnDonToDonDeck(event.playerSessionId, 1);

    anyEngine.decisions.chooseCards(
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
          patchSpecialHandlerCardStatus(host, card, {
            effectNegated: true,
          });
          host.syncPlayer(card.ownerSessionId);

          if ((card.power ?? 0) <= 5000) {
            host.moveCard(card, event.playerSessionId, 'trash');
          }
        }
        engine.reapplyContinuousEffects();
      },
    );
  },
};
