import type { DuelCard } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

/**
 * Edward.Newgate (ST13-004) special handler.
 *
 * [On Play] Add 1 card from the top of your deck to the top of your Life
 * cards. Then, look at all your Life cards; place 1 card at the top of your
 * deck and place the rest back in your Life area in any order.
 */
export const st13004SpecialHandler: SpecialHandlerDefinition = {
  id: 'st13-004-special',
  cardId: 'ST13-004',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    const player = engine.getPlayer(event.playerSessionId);
    if (!player || player.zones.deck.length < 1) return;

    const topDeck = player.zones.deck[0];
    engine.moveCard(topDeck, event.playerSessionId, 'life', { faceDown: true });
    engine.addLog(`[Edward.Newgate] Added top deck card to Life.`);

    const lifeCards = Array.from(player.zones.life);
    if (lifeCards.length === 0) return;

    engine.chooseCards(
      `${event.sourceInstanceId}:st13-004:pick`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      'Choose 1 Life card to place on top of your deck.',
      {
        player: 'self',
        zones: ['life'],
        count: { kind: 'exact', value: 1 },
      },
      undefined,
      (selected: DuelCard[]) => {
        const toDeck = selected[0];
        if (!toDeck) return;

        const remaining = lifeCards.filter(
          (c: DuelCard) => c.instanceId !== toDeck.instanceId,
        );

        engine.moveCard(toDeck, event.playerSessionId, 'deck');
        engine.addLog(
          `[Edward.Newgate] Moved ${toDeck.name} from Life to top of deck.`,
        );

        if (remaining.length <= 1) {
          engine.syncPlayer(event.playerSessionId);
          return;
        }

        const reorderNext = (cards: DuelCard[], ordered: DuelCard[]) => {
          if (cards.length <= 1) {
            engine.setZoneOrder(
              event.playerSessionId,
              'life',
              [...ordered, ...cards].map((card) => card.instanceId),
            );
            return;
          }

          engine.chooseCards(
            `${event.sourceInstanceId}:st13-004:reorder:${ordered.length}`,
            event.playerSessionId,
            {
              sourceInstanceId: event.sourceInstanceId,
              storedSelections: {},
            },
            event.playerSessionId,
            `Choose the next card for your Life area (${ordered.length + 1} of ${remaining.length}).`,
            {
              player: 'self',
              zones: ['life'],
              count: { kind: 'exact', value: 1 },
            },
            undefined,
            (picked: DuelCard[]) => {
              const next = picked[0] as DuelCard | undefined;
              if (!next) {
                reorderNext(cards, ordered);
                return;
              }
              const idx = cards.findIndex(
                (c: DuelCard) => c.instanceId === next.instanceId,
              );
              if (idx < 0) {
                reorderNext(cards, ordered);
                return;
              }
              cards.splice(idx, 1);
              reorderNext(cards, [...ordered, next]);
            },
          );
        };

        reorderNext([...remaining] as DuelCard[], []);
      },
    );
  },
};
