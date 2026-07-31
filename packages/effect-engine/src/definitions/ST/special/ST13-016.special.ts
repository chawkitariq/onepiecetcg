import type { DuelCard } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

/**
 * Yamato (ST13-016) special handler.
 *
 * [On Play] Look at all your Life cards; place 1 at the top of your deck
 * and place the rest back in your Life area in any order.
 */
export const st13016SpecialHandler: SpecialHandlerDefinition = {
  id: 'st13-016-special',
  cardId: 'ST13-016',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    const player = engine.getPlayer(event.playerSessionId);
    if (!player || player.zones.life.length < 1) return;

    const lifeCards = Array.from(player.zones.life);

    engine.chooseCards(
      `${event.sourceInstanceId}:st13-016:pick`,
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
        engine.addLog(`[Yamato] Moved ${toDeck.name} from Life to top of deck.`);

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
            `${event.sourceInstanceId}:st13-016:reorder:${ordered.length}`,
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
