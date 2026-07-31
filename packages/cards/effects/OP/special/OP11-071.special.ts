/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * Charlotte Perospero handler.
 *
 * [Activate: Main] [Once Per Turn] You may trash 1 card from your hand:
 * Choose a cost and reveal 1 card from the top of your opponent's deck.
 * If the revealed card has the chosen cost, draw 1 card and add up to 1
 * DON!! card from your DON!! deck and set it as active.
 */
export const op11071SpecialHandler: SpecialHandlerDefinition = {
  id: 'op11-071-special',
  cardId: 'OP11-071',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;

    const oncePerTurnKey = `${event.sourceInstanceId}:op11-071:${host.state.turn}`;
    if (anyEngine.resolvedOncePerTurnKeys?.has(oncePerTurnKey)) return;

    const handCards = host.getCards(
      {
        player: 'self',
        zones: ['hand'],
        count: { kind: 'upTo', value: 1 },
      },
      event.playerSessionId,
    );
    if (handCards.length === 0) return;

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
        id: `${event.sourceInstanceId}:op11-071:confirm`,
        effectId: 'op11-071-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message: '[Charlotte Perospero] Trash 1 from hand to activate?',
          optional: true,
        },
      },
      (confirmResponse: { confirmed?: boolean }) => {
        if (!confirmResponse.confirmed) return;

        anyEngine.resolvedOncePerTurnKeys?.add(oncePerTurnKey);

        anyEngine.decisions.chooseCards(
          `${event.sourceInstanceId}:op11-071:trash`,
          event.playerSessionId,
          {
            sourceInstanceId: event.sourceInstanceId,
            storedSelections: {},
          },
          event.playerSessionId,
          '[Charlotte Perospero] Choose 1 card from your hand to trash:',
          {
            player: 'self',
            zones: ['hand'],
            count: { kind: 'exact', value: 1 },
          },
          undefined,
          (trashed) => {
            for (const card of trashed) {
              host.moveCard(card, event.playerSessionId, 'trash');
            }

            anyEngine.decisions.pause(
              {
                id: `${event.sourceInstanceId}:op11-071:choose-cost`,
                effectId: 'op11-071-special',
                effectCardId: event.sourceCardId,
                sourceInstanceId: event.sourceInstanceId,
                playerSessionId: event.playerSessionId,
                createdAt: new Date().toISOString(),
                prompt: {
                  type: 'selectChoice',
                  message: '[Charlotte Perospero] Choose a cost:',
                  choices: costChoices,
                  min: 1,
                  max: 1,
                },
              },
              (costResponse: { selectedChoiceIds?: string[] }) => {
                const chosenCostStr = costResponse.selectedChoiceIds?.[0];
                if (!chosenCostStr) return;

                const chosenCost = parseInt(
                  chosenCostStr.replace('cost-', ''),
                  10,
                );

                const topCards = host.getCards(
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

                host.addLog?.(
                  `[Perospero] Revealed: ${revealed.name} (cost ${revealedCost}). Chosen: ${chosenCost}.`,
                );

                if (revealedCost === chosenCost) {
                  host.drawCard(event.playerSessionId);
                  host.addDonToCost(event.playerSessionId, 1, false);
                }

                engine.reapplyContinuousEffects();
              },
            );
          },
        );
      },
    );
  },
};
