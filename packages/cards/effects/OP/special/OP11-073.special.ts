/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
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

    const anyEngine = engine as any;
    const host = anyEngine.host;

    const oncePerTurnKey = `${event.sourceInstanceId}:op11-073:${host.state.turn}`;
    if (anyEngine.resolvedOncePerTurnKeys?.has(oncePerTurnKey)) return;

    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    let donOnField =
      player.zones.cost.length + (player.zones.leader.attachedDon ?? 0);
    for (const char of player.zones.characters) {
      donOnField += char.attachedDon ?? 0;
    }

    if (donOnField < 5) return;

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

        anyEngine.resolvedOncePerTurnKeys?.add(oncePerTurnKey);

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
          `[Linlin] Revealed: ${revealed.name} (cost ${revealedCost}). Chosen: ${chosenCost}.`,
        );

        if (revealedCost === chosenCost) {
          anyEngine.modifiers.addPowerModifier(
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
