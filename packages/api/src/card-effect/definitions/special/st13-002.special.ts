/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { DuelCard } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';
import {
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
} from './special-handler-utils';

/**
 * Portgas.D.Ace (ST13-002) Leader special handler.
 *
 * [DON!! x2][Activate: Main][Once Per Turn] Look at 5 cards from the top of
 * your deck and add up to 1 Character card with a cost of 5 to the top of
 * your Life cards face-up. Then, place the rest at the bottom of your deck
 * in any order.
 *
 * [End of Your Turn] Trash all your face-up Life cards.
 */
export const st13002SpecialHandler: SpecialHandlerDefinition = {
  id: 'st13-002-special',
  cardId: 'ST13-002',
  resolve(event, engine) {
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    if (event.type === 'activateMain') {
      if (source.attachedDon < 2) return;
      if (
        hasResolvedOncePerTurn(
          anyEngine,
          event.sourceInstanceId,
          'st13-002-main',
          host.state.turn,
        )
      )
        return;

      const player = host.getPlayer(event.playerSessionId);
      if (!player || player.zones.deck.length < 1) return;

      anyEngine.decisions.pause(
        {
          id: `${event.sourceInstanceId}:st13-002:confirm`,
          effectId: 'st13-002-special',
          effectCardId: event.sourceCardId,
          sourceInstanceId: event.sourceInstanceId,
          playerSessionId: event.playerSessionId,
          createdAt: new Date().toISOString(),
          prompt: {
            type: 'confirm',
            message:
              '[Portgas.D.Ace Leader] Look at 5 cards from deck and add 1 Character (cost 5) to Life face-up?',
            optional: true,
          },
        },
        (response: { confirmed?: boolean }) => {
          if (!response.confirmed) return;

          markResolvedOncePerTurn(
            anyEngine,
            event.sourceInstanceId,
            'st13-002-main',
            host.state.turn,
          );

          const topCards = Array.from(player.zones.deck).slice(0, 5);
          const topCardNames = topCards.map((c: DuelCard) => c.name);
          const topCardIds = new Set(
            topCards.map((c: DuelCard) => c.instanceId),
          );

          anyEngine.decisions.chooseCards(
            `${event.sourceInstanceId}:st13-002:pick`,
            event.playerSessionId,
            { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
            event.playerSessionId,
            'Choose up to 1 Character (cost 5) to add to Life face-up.',
            {
              player: 'self',
              zones: ['deck'],
              filter: {
                cardCategory: ['Character'],
                costMin: 5,
                costMax: 5,
              },
              count: { kind: 'upTo', value: 1 },
            },
            topCardNames,
            (selected: DuelCard[]) => {
              const chosen = selected.find((c: DuelCard) =>
                topCardIds.has(c.instanceId),
              );
              if (chosen) {
                host.moveCard(chosen, event.playerSessionId, 'life', {
                  faceDown: false,
                });
                host.addLog(
                  `[Portgas.D.Ace Leader] Added ${chosen.name} to Life face-up.`,
                );
              }

              const remainingCount = topCards.length - (chosen ? 1 : 0);
              if (remainingCount > 0) {
                anyEngine.actions.resolveActions(
                  [
                    {
                      type: 'arrangeDeckWindow',
                      player: 'self',
                      amount: remainingCount,
                    },
                  ],
                  event.playerSessionId,
                  source,
                  {
                    sourceInstanceId: event.sourceInstanceId,
                    storedSelections: {},
                  },
                  0,
                  () => {
                    host.syncPlayer(event.playerSessionId);
                  },
                );
              } else {
                host.syncPlayer(event.playerSessionId);
              }
            },
          );
        },
      );
      return;
    }

    if (event.type === 'onTurnEnd') {
      const player = host.getPlayer(event.playerSessionId);
      if (!player) return;

      const faceUpLife = Array.from(player.zones.life).filter(
        (c: DuelCard) => !c.faceDown,
      );
      if (faceUpLife.length === 0) return;

      for (const card of faceUpLife) {
        host.moveCard(card, event.playerSessionId, 'trash');
      }
      host.addLog(
        '[Portgas.D.Ace Leader] Trashed all face-up Life cards at end of turn.',
      );
      host.syncPlayer(event.playerSessionId);
    }
  },
};
