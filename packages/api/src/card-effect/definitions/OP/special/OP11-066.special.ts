/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils';

/**
 * Charlotte Oven handler.
 *
 * [Activate: Main] You may rest this Character: Choose a cost and reveal 1
 * card from the top of your opponent's deck. If the revealed card has the
 * chosen cost, K.O. up to 1 of your opponent's Characters with a base cost
 * of 3 or less. Then, add up to 1 DON!! card from your DON!! deck and rest it.
 */
export const op11066SpecialHandler: SpecialHandlerDefinition = {
  id: 'op11-066-special',
  cardId: 'OP11-066',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;

    const opponentId = engine.getOpponentSessionId(event.playerSessionId);
    if (!opponentId) return;

    const opponent = engine.getPlayer(opponentId);
    if (!opponent || opponent.zones.deck.length === 0) return;

    const costChoices = Array.from({ length: 11 }, (_, i) => ({
      id: `cost-${i}`,
      label: `Cost ${i}`,
    }));

    engine.pauseDecision(
      {
        id: `${event.sourceInstanceId}:op11-066:confirm`,
        effectId: 'op11-066-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message: '[Charlotte Oven] Rest this Character to activate?',
          optional: true,
        },
      },
      (confirmResponse: { confirmed?: boolean }) => {
        if (!confirmResponse.confirmed) return;

        const source = engine.getCard(event.sourceInstanceId);
        if (source) {
          patchSpecialHandlerCardStatus(engine, source, { rested: true });
        }

        engine.pauseDecision(
          {
            id: `${event.sourceInstanceId}:op11-066:choose-cost`,
            effectId: 'op11-066-special',
            effectCardId: event.sourceCardId,
            sourceInstanceId: event.sourceInstanceId,
            playerSessionId: event.playerSessionId,
            createdAt: new Date().toISOString(),
            prompt: {
              type: 'selectChoice',
              message: '[Charlotte Oven] Choose a cost:',
              choices: costChoices,
              min: 1,
              max: 1,
            },
          },
          (costResponse: { selectedChoiceIds?: string[] }) => {
            const chosenCostStr = costResponse.selectedChoiceIds?.[0];
            if (!chosenCostStr) return;

            const chosenCost = parseInt(chosenCostStr.replace('cost-', ''), 10);

            const topCards = engine.getCards(
              {
                player: 'opponent',
                zones: ['deck'],
                filter: { zonePosition: 'top' },
                count: { kind: 'exact', value: 1 },
              },
              event.playerSessionId,
            );
            if (topCards.length === 0) return;

            const revealed = topCards[0];
            const revealedCost = revealed.baseCost ?? revealed.cost ?? -1;

            engine.addLog(
              `[Oven] Revealed: ${revealed.name} (cost ${revealedCost}). Chosen: ${chosenCost}.`,
            );

            if (revealedCost === chosenCost) {
              engine.chooseCards(
                `${event.sourceInstanceId}:op11-066:ko-target`,
                event.playerSessionId,
                {
                  sourceInstanceId: event.sourceInstanceId,
                  storedSelections: {},
                },
                event.playerSessionId,
                '[Charlotte Oven] Choose up to 1 opponent Character (base cost 3 or less) to K.O.:',
                {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    baseCostMax: 3,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                undefined,
                (koTargets) => {
                  for (const card of koTargets) {
                    engine.koCharacter(
                      card.ownerSessionId,
                      card.instanceId,
                      'effect',
                    );
                  }

                  engine.addDonToCost(event.playerSessionId, 1, true);
                  engine.reapplyContinuousEffects();
                },
              );
            } else {
              engine.reapplyContinuousEffects();
            }
          },
        );
      },
    );
  },
};
