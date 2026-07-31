import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * Charlotte Linlin handler — Rush is handled by a continuous effect in
 * the main definitions.
 *
 * [On Your Opponent's Attack] [Once Per Turn] DON!! 5: Choose a cost and
 * reveal 1 card from the top of your opponent's deck. If the revealed card
 * has the chosen cost, up to 1 of your Leader gains +2000 power during
 * this turn.
 */
export const op11073SpecialHandler: SpecialHandlerDefinition = {
  id: 'op11-073-special',
  cardId: 'OP11-073',
  resolve(event, engine) {
    if (event.type !== 'onAttacked') return;

    const oncePerTurnKey = `${event.sourceInstanceId}:op11-073:${engine.state.turn}`;
    if (engine.hasResolvedOncePerTurnKey(oncePerTurnKey)) return;

    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;

    let donOnField =
      player.zones.cost.length + (player.zones.leader.attachedDon ?? 0);
    for (const char of player.zones.characters) {
      donOnField += char.attachedDon ?? 0;
    }

    if (donOnField < 5) return;

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
        id: `${event.sourceInstanceId}:op11-073:choose-cost`,
        effectId: 'op11-073-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'selectChoice',
          message: '[Charlotte Linlin] Choose a cost:',
          choices: costChoices,
          min: 1,
          max: 1,
        },
      },
      (response: { selectedChoiceIds?: string[] }) => {
        const chosenCostStr = response.selectedChoiceIds?.[0];
        if (!chosenCostStr) return;

        engine.markResolvedOncePerTurnKey(oncePerTurnKey);

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
          `[Linlin] Revealed: ${revealed.name} (cost ${revealedCost}). Chosen: ${chosenCost}.`,
        );

        if (revealedCost === chosenCost) {
          engine.addPowerModifier(
            event.sourceInstanceId,
            event.playerSessionId,
            player.zones.leader.instanceId,
            2000,
            'untilEndOfTurn',
          );
        }

        engine.reapplyContinuousEffects();
      },
    );
  },
};
