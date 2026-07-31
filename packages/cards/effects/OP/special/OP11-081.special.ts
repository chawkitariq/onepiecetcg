/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * "Cognac Mama-Mash" handler.
 *
 * [Main] Choose a cost and reveal 1 card from the top of your opponent's
 * deck. If the revealed card has the chosen cost, K.O. up to 1 of your
 * opponent's Characters with a base cost of 8 or less.
 *
 * [Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.
 */
export const op11081SpecialHandler: SpecialHandlerDefinition = {
  id: 'op11-081-special',
  cardId: 'OP11-081',
  resolve(event, engine) {
    if (event.type === 'trigger') {
      const triggerDef: StandardEffectDefinition = {
        id: 'cognac-mama-mash-trigger-add-don-active',
        text: '[Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.',
        trigger: { type: 'trigger' },
        actions: [{ type: 'addDon', player: 'self', amount: 1, rested: false }],
      };

      engine.queueEffect(
        event.playerSessionId,
        event.sourceInstanceId,
        event.sourceCardId,
        triggerDef,
      );
      return;
    }

    if (event.type !== 'activateMain') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;

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
        id: `${event.sourceInstanceId}:op11-081:choose-cost`,
        effectId: 'op11-081-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'selectChoice',
          message: '[Cognac Mama-Mash] Choose a cost:',
          choices: costChoices,
          min: 1,
          max: 1,
        },
      },
      (response: { selectedChoiceIds?: string[] }) => {
        const chosenCostStr = response.selectedChoiceIds?.[0];
        if (!chosenCostStr) return;

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
        if (topCards.length === 0) return;

        const revealed = topCards[0];
        const revealedCost = revealed.baseCost ?? revealed.cost ?? -1;

        host.addLog?.(
          `[Cognac Mama-Mash] Revealed: ${revealed.name} (cost ${revealedCost}). Chosen: ${chosenCost}.`,
        );

        if (revealedCost === chosenCost) {
          anyEngine.decisions.chooseCards(
            `${event.sourceInstanceId}:op11-081:ko-target`,
            event.playerSessionId,
            {
              sourceInstanceId: event.sourceInstanceId,
              storedSelections: {},
            },
            event.playerSessionId,
            '[Cognac Mama-Mash] Choose up to 1 opponent Character (base cost 8 or less) to K.O.:',
            {
              player: 'opponent',
              zones: ['characters'],
              filter: {
                cardCategory: ['Character'],
                baseCostMax: 8,
              },
              count: { kind: 'upTo', value: 1 },
            },
            undefined,
            (koTargets) => {
              for (const card of koTargets) {
                host.koCharacter(
                  event.playerSessionId,
                  card.instanceId,
                  'effect',
                );
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
};
