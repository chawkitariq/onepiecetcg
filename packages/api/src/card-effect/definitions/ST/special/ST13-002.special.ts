import type { DuelCard } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';
import {
  createOncePerTurnKey,
} from '../../special-handler-utils';

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
    const source = engine.getCard(event.sourceInstanceId);
    if (!source) return;

    if (event.type === 'activateMain') {
      if (source.attachedDon < 2) return;
      const oncePerTurnKey = createOncePerTurnKey(
        event.sourceInstanceId,
        'st13-002-main',
        engine.state.turn,
      );
      if (
        engine.hasResolvedOncePerTurnKey(oncePerTurnKey)
      )
        return;

      const player = engine.getPlayer(event.playerSessionId);
      if (!player || player.zones.deck.length < 1) return;

      engine.pauseDecision(
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

          engine.markResolvedOncePerTurnKey(oncePerTurnKey);

          const topCards = Array.from(player.zones.deck).slice(0, 5);
          const topCardNames = topCards.map((c: DuelCard) => c.name);
          const topCardIds = new Set(
            topCards.map((c: DuelCard) => c.instanceId),
          );

          engine.chooseCards(
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
                engine.moveCard(chosen, event.playerSessionId, 'life', {
                  faceDown: false,
                });
                engine.addLog(
                  `[Portgas.D.Ace Leader] Added ${chosen.name} to Life face-up.`,
                );
              }

              const remainingCount = topCards.length - (chosen ? 1 : 0);
              if (remainingCount > 0) {
                engine.arrangeDeckWindow(
                  event.playerSessionId,
                  source,
                  remainingCount,
                  () => {
                    engine.syncPlayer(event.playerSessionId);
                  },
                );
              } else {
                engine.syncPlayer(event.playerSessionId);
              }
            },
          );
        },
      );
      return;
    }

    if (event.type === 'onTurnEnd') {
      const player = engine.getPlayer(event.playerSessionId);
      if (!player) return;

      const faceUpLife = Array.from(player.zones.life).filter(
        (c: DuelCard) => !c.faceDown,
      );
      if (faceUpLife.length === 0) return;

      for (const card of faceUpLife) {
        engine.moveCard(card, event.playerSessionId, 'trash');
      }
      engine.addLog(
        '[Portgas.D.Ace Leader] Trashed all face-up Life cards at end of turn.',
      );
      engine.syncPlayer(event.playerSessionId);
    }
  },
};
