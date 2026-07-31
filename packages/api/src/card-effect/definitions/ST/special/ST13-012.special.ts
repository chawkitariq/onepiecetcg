import type { DuelCard } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

/**
 * Makino (ST13-012) special handler.
 *
 * [On Play] You may add 1 card from the top or bottom of your Life cards to
 * your hand: Look at all of your Life cards and place them back in your Life
 * area in any order.
 */
export const st13012SpecialHandler: SpecialHandlerDefinition = {
  id: 'st13-012-special',
  cardId: 'ST13-012',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    const player = engine.getPlayer(event.playerSessionId);
    if (!player || (player.zones.life as DuelCard[]).length < 1) return;

    engine.pauseDecision(
      {
        id: `${event.sourceInstanceId}:st13-012:confirm`,
        effectId: 'st13-012-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message: '[Makino] Add 1 card from top or bottom of Life to hand?',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) return;

        const lifeLen = player.zones.life.length;
        const isSingle = lifeLen === 1;

        const doAddAndReorder = (fromTop: boolean) => {
          const cardToAdd = fromTop
            ? player.zones.life[0]
            : player.zones.life[player.zones.life.length - 1];

          if (!cardToAdd) return;

          engine.moveCard(cardToAdd, event.playerSessionId, 'hand');
          engine.addLog(`[Makino] Added ${cardToAdd.name} from Life to hand.`);

          const remaining = Array.from(player.zones.life);
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
              `${event.sourceInstanceId}:st13-012:reorder:${ordered.length}`,
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
        };

        if (isSingle) {
          doAddAndReorder(true);
        } else {
          engine.chooseChoices(
            `${event.sourceInstanceId}:st13-012:position`,
            event.playerSessionId,
            'Add card from top or bottom of Life?',
            [
              { id: 'top', label: 'Top of Life' },
              { id: 'bottom', label: 'Bottom of Life' },
            ],
            1,
            1,
            (choiceIds: string[]) => {
              doAddAndReorder(choiceIds[0] === 'top');
            },
          );
        }
      },
    );
  },
};
