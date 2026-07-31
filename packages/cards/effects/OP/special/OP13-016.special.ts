/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { DuelCard } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * Handles Monkey.D.Garp:
 * [On Play] If your Leader is [Sabo], [Portgas.D.Ace] or [Monkey.D.Luffy],
 * look at 4 cards from the top of your deck; reveal up to 1 card with a cost of 3
 * or more and add it to your hand. Then, place the rest at the bottom of your deck
 * in any order.
 */
export const op13016SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-016-special',
  cardId: 'OP13-016',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    const source = host.getCard(event.sourceInstanceId);
    if (!player || !source) return;

    const leader = player.zones.leader;
    const validLeaders = ['Sabo', 'Portgas.D.Ace', 'Monkey.D.Luffy'];
    if (!leader || !validLeaders.includes(leader.name)) return;

    const topCards = Array.from(player.zones.deck).slice(0, 4) as DuelCard[];
    if (topCards.length === 0) return;

    const topCardIds = new Set(topCards.map((c) => c.instanceId));

    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op13-016:top4`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Monkey.D.Garp] Choose up to 1 card with cost 3+ to add to hand:',
      {
        player: 'self',
        zones: ['deck'],
        count: { kind: 'upTo', value: 1 },
      },
      topCards.map((c) => c.name),
      (selected) => {
        const chosen = (selected as DuelCard[]).find((c) =>
          topCardIds.has(c.instanceId),
        );

        if (chosen && (chosen.cost >= 3 || chosen.baseCost >= 3)) {
          host.moveCard(chosen, event.playerSessionId, 'hand');
        }

        const remaining = topCards.filter(
          (c) => !chosen || c.instanceId !== chosen.instanceId,
        );

        if (remaining.length > 0) {
          const remainingIds = new Set(remaining.map((c) => c.instanceId));

          anyEngine.decisions.chooseCards(
            `${event.sourceInstanceId}:op13-016:return-bottom`,
            event.playerSessionId,
            {
              sourceInstanceId: event.sourceInstanceId,
              storedSelections: {},
            },
            event.playerSessionId,
            '[Monkey.D.Garp] Reorder remaining cards (order selected = order placed on bottom):',
            {
              player: 'self',
              zones: ['deck'],
              count: { kind: 'exact', value: remaining.length },
            },
            remaining.map((c) => c.name),
            (ordered) => {
              for (const card of ordered as DuelCard[]) {
                if (remainingIds.has(card.instanceId)) {
                  host.moveCard(card, event.playerSessionId, 'deck', {
                    toBottom: true,
                  });
                }
              }
              host.syncPlayer(event.playerSessionId);
            },
          );
        } else {
          host.syncPlayer(event.playerSessionId);
        }
      },
    );
  },
};
