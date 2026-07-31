import type { DuelCard } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * Handles Kouzuki Momonosuke:
 * [On Play] Look at all of your Life cards and place them back in your Life area
 * in any order.
 */
export const op13105SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-105-special',
  cardId: 'OP13-105',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const lifeCards = Array.from(player.zones.life) as DuelCard[];
    if (lifeCards.length <= 1) return;

    const lifeIds = new Set(lifeCards.map((c) => c.instanceId));

    engine.chooseCards(
      `${event.sourceInstanceId}:op13-105:reorder-life`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Kouzuki Momonosuke] Reorder your Life cards (first selected = top):',
      {
        player: 'self',
        zones: ['life'],
        count: { kind: 'exact', value: lifeCards.length },
      },
      lifeCards.map((c: DuelCard) => c.name),
      (ordered) => {
        const filtered = (ordered as DuelCard[]).filter((c) =>
          lifeIds.has(c.instanceId),
        );

        const reorderedLife = [
          ...filtered,
          ...lifeCards.filter(
            (c) => !filtered.some((f) => f.instanceId === c.instanceId),
          ),
        ];

        engine.setZoneOrder(
          event.playerSessionId,
          'life',
          reorderedLife.map((card) => card.instanceId),
        );
        engine.syncPlayer(event.playerSessionId);
        engine.addLog('[Kouzuki Momonosuke] Life cards reordered.');
      },
    );
  },
};
