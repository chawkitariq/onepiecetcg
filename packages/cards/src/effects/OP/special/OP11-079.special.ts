import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * "When Two Men Are Fighting the Last Thing I Need Is Some Half-Hearted
 * Assistance!!!!" handler.
 *
 * [Counter] Choose a cost and reveal 1 card from the top of your opponent's
 * deck. If the revealed card has the chosen cost, up to 1 of your Leader or
 * Character cards gains +5000 power during this battle.
 *
 * [Trigger] Draw 1 card.
 */
export const op11079SpecialHandler: SpecialHandlerDefinition = {
  id: 'op11-079-special',
  cardId: 'OP11-079',
  resolve(event, engine) {
    if (event.type === 'trigger') {
      const triggerDef: StandardEffectDefinition = {
        id: 'when-two-men-are-fighting-trigger-draw-1',
        text: '[Trigger] Draw 1 card.',
        trigger: { type: 'trigger' },
        actions: [{ type: 'draw', player: 'self', amount: 1 }],
      };

      engine.queueEffect(
        event.playerSessionId,
        event.sourceInstanceId,
        event.sourceCardId,
        triggerDef,
      );
      return;
    }

    if (event.type !== 'activateCounter') return;

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
        id: `${event.sourceInstanceId}:op11-079:choose-cost`,
        effectId: 'op11-079-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'selectChoice',
          message: '["When Two Men Are Fighting..."] Choose a cost:',
          choices: costChoices,
          min: 1,
          max: 1,
        },
      },
      (response: { selectedChoiceIds?: string[] }) => {
        const chosenCostStr = response.selectedChoiceIds?.[0];
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

        engine.addLog?.(
          `[When Two Men Are Fighting...] Revealed: ${revealed.name} (cost ${revealedCost}). Chosen: ${chosenCost}.`,
        );

        if (revealedCost === chosenCost) {
          engine.chooseCards(
            `${event.sourceInstanceId}:op11-079:power-target`,
            event.playerSessionId,
            {
              sourceInstanceId: event.sourceInstanceId,
              storedSelections: {},
            },
            event.playerSessionId,
            '["When Two Men Are Fighting..."] Choose up to 1 of your Leader or Characters to gain +5000 power:',
            {
              player: 'self',
              zones: ['leader', 'characters'],
              filter: { cardCategory: ['Character', 'Leader'] },
              count: { kind: 'upTo', value: 1 },
            },
            undefined,
            (selected) => {
              for (const card of selected) {
                engine.addPowerModifier(
                  event.sourceInstanceId,
                  event.playerSessionId,
                  card.instanceId,
                  5000,
                  'untilEndOfBattle',
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
