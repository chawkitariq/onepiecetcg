import type { DuelCard } from '@onepiecetcg/shared';

import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * Handles Ulti because the leader-multicolor condition is not native and the
 * top-three window needs one card to go to hand before deck reordering.
 */
export const op05043SpecialHandler: SpecialHandlerDefinition = {
  id: 'op05-043-special',
  cardId: 'OP05-043',
  resolve(event, engine) {
    if (event.type !== 'onPlay') {
      return;
    }

    const player = engine.getPlayer(event.playerSessionId);
    const leader = player?.zones.leader;

    if (!player || !leader || leader.colors.length < 2) {
      return;
    }

    const source = engine.getCard(event.sourceInstanceId);

    if (!source) {
      return;
    }

    const topCards = Array.from(player.zones.deck).slice(0, 3) as DuelCard[];
    const topCardIds = new Set(topCards.map((card) => card.instanceId));

    engine.chooseCards(
      `${event.sourceInstanceId}:op05-043:top3`,
      event.playerSessionId,
      {
        sourceInstanceId: event.sourceInstanceId,
        storedSelections: {},
      },
      event.playerSessionId,
      "Choisissez jusqu'a 1 carte parmi les 3 cartes du dessus du deck.",
      {
        player: 'self',
        zones: ['deck'],
        count: { kind: 'upTo', value: 1 },
      },
      topCards.map((card) => card.name),
      (cards) => {
        const selected = (cards as DuelCard[]).find((card) =>
          topCardIds.has(card.instanceId),
        );

        if (selected) {
          engine.moveCard(selected, event.playerSessionId, 'hand');
        }

        const remainingCount = topCards.length - (selected ? 1 : 0);

        if (remainingCount <= 0) {
          engine.syncPlayer(event.playerSessionId);
          return;
        }

        engine.arrangeDeckWindow(
          event.playerSessionId,
          source,
          remainingCount,
          () => engine.syncPlayer(event.playerSessionId),
        );
      },
    );
  },
};
