/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

/**
 * Streusen handler.
 *
 * [Activate: Main] [Once Per Turn] DON!! 1, You may rest this Character:
 * Choose a cost and reveal 1 card from the top of your opponent's deck.
 * If the revealed card has the chosen cost, rest up to 1 of your opponent's
 * Characters with a cost of 4 or less.
 *
 * DON!! 1 is a condition (need at least 1 DON!! on field), not a cost.
 */
export const op11074SpecialHandler: SpecialHandlerDefinition = {
  id: 'op11-074-special',
  cardId: 'OP11-074',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;

    const oncePerTurnKey = `${event.sourceInstanceId}:op11-074:${host.state.turn}`;
    if (anyEngine.resolvedOncePerTurnKeys?.has(oncePerTurnKey)) return;

    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    let totalDonOnField =
      player.zones.cost.length + (player.zones.leader.attachedDon ?? 0);
    for (const char of player.zones.characters) {
      totalDonOnField += char.attachedDon ?? 0;
    }

    if (totalDonOnField < 1) return;

    const opponentId = host.getOpponentSessionId(event.playerSessionId);
    if (!opponentId) return;

    const opponent = host.getPlayer(opponentId);
    if (!opponent || opponent.zones.deck.length === 0) return;

    const costChoices = Array.from({ length: 11 }, (_, i) => ({
      id: `cost-${i}`,
      label: `Cost ${i}`,
    }));

    anyEngine.decisions.pause(
      {
        id: `${event.sourceInstanceId}:op11-074:confirm`,
        effectId: 'op11-074-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message: '[Streusen] Rest this Character to activate?',
          optional: true,
        },
      },
      (confirmResponse: { confirmed?: boolean }) => {
        if (!confirmResponse.confirmed) return;

        anyEngine.resolvedOncePerTurnKeys?.add(oncePerTurnKey);

        const source = host.getCard(event.sourceInstanceId);
        if (source) {
          source.rested = true;
        }

        anyEngine.decisions.pause(
          {
            id: `${event.sourceInstanceId}:op11-074:choose-cost`,
            effectId: 'op11-074-special',
            effectCardId: event.sourceCardId,
            sourceInstanceId: event.sourceInstanceId,
            playerSessionId: event.playerSessionId,
            createdAt: new Date().toISOString(),
            prompt: {
              type: 'selectChoice',
              message: '[Streusen] Choose a cost:',
              choices: costChoices,
              min: 1,
              max: 1,
            },
          },
          (costResponse: { selectedChoiceIds?: string[] }) => {
            const chosenCostStr = costResponse.selectedChoiceIds?.[0];
            if (!chosenCostStr) {
              engine.reapplyContinuousEffects();
              return;
            }

            const chosenCost = parseInt(chosenCostStr.replace('cost-', ''), 10);

            const topCards = host.getCards(
              {
                player: 'opponent',
                zones: ['deck'],
                filter: { zonePosition: 'top' },
                count: { kind: 'exact', value: 1 },
              },
              event.playerSessionId,
            );
            if (topCards.length === 0) {
              engine.reapplyContinuousEffects();
              return;
            }

            const revealed = topCards[0];
            const revealedCost = revealed.baseCost ?? revealed.cost ?? -1;

            host.addLog?.(
              `[Streusen] Revealed: ${revealed.name} (cost ${revealedCost}). Chosen: ${chosenCost}.`,
            );

            if (revealedCost === chosenCost) {
              anyEngine.decisions.chooseCards(
                `${event.sourceInstanceId}:op11-074:rest-target`,
                event.playerSessionId,
                {
                  sourceInstanceId: event.sourceInstanceId,
                  storedSelections: {},
                },
                event.playerSessionId,
                '[Streusen] Choose up to 1 opponent Character (cost 4 or less) to rest:',
                {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 4,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                undefined,
                (restTargets) => {
                  for (const card of restTargets) {
                    card.rested = true;
                  }
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
