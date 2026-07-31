import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * Nami Leader handler — two effects:
 *
 * 1. [Your Turn] [Once Per Turn] When a card is removed from your or your
 *    opponent's Life cards, if you have 7 or less cards in your hand, draw 1 card.
 *
 * 2. [DON!! x1] [On Your Opponent's Attack] [Once Per Turn] You may trash 1
 *    card from your hand: This Leader gains +2000 power during this turn.
 */
export const op11041SpecialHandler: SpecialHandlerDefinition = {
  id: 'op11-041-special',
  cardId: 'OP11-041',
  resolve(event, engine) {
    const turn = engine.state.turn;

    if (event.type === 'onLifeDamageDealt') {
      const oncePerTurnKey = `${event.sourceInstanceId}:op11-041:draw:${turn}`;
      if (engine.hasResolvedOncePerTurnKey(oncePerTurnKey)) return;

      const player = engine.getPlayer(event.playerSessionId);
      if (!player) return;

      if (player.zones.hand.length > 7) return;

      engine.markResolvedOncePerTurnKey(oncePerTurnKey);

      const drawDef: StandardEffectDefinition = {
        id: 'nami-leader-life-removed-draw',
        text: '[Your Turn] [Once Per Turn] When a card is removed from Life, if you have 7 or less cards in your hand, draw 1 card.',
        trigger: { type: 'onLifeDamageDealt', oncePerTurn: true },
        actions: [{ type: 'draw', player: 'self', amount: 1 }],
      };

      engine.queueEffect(
        event.playerSessionId,
        event.sourceInstanceId,
        event.sourceCardId,
        drawDef,
      );
      return;
    }

    if (event.type === 'onAttacked') {
      const oncePerTurnKey = `${event.sourceInstanceId}:op11-041:power:${turn}`;
      if (engine.hasResolvedOncePerTurnKey(oncePerTurnKey)) return;

      const player = engine.getPlayer(event.playerSessionId);
      if (!player) return;

      const hasDonAttached = (player.zones.leader.attachedDon ?? 0) >= 1;
      if (!hasDonAttached) return;

      const handCards = engine.getCards(
        {
          player: 'self',
          zones: ['hand'],
          count: { kind: 'upTo', value: 1 },
        },
        event.playerSessionId,
      );
      if (handCards.length === 0) return;

      engine.pauseDecision(
        {
          id: `${event.sourceInstanceId}:op11-041:confirm-power`,
          effectId: 'op11-041-special',
          effectCardId: event.sourceCardId,
          sourceInstanceId: event.sourceInstanceId,
          playerSessionId: event.playerSessionId,
          createdAt: new Date().toISOString(),
          prompt: {
            type: 'confirm',
            message: '[Nami] Trash 1 card from your hand to give Leader +2000?',
            optional: true,
          },
        },
        (response: { confirmed?: boolean }) => {
          if (!response.confirmed) return;

          engine.markResolvedOncePerTurnKey(oncePerTurnKey);

          engine.chooseCards(
            `${event.sourceInstanceId}:op11-041:trash`,
            event.playerSessionId,
            {
              sourceInstanceId: event.sourceInstanceId,
              storedSelections: {},
            },
            event.playerSessionId,
            '[Nami] Choose 1 card from your hand to trash:',
            {
              player: 'self',
              zones: ['hand'],
              count: { kind: 'exact', value: 1 },
            },
            undefined,
            (trashed) => {
              for (const card of trashed) {
                engine.moveCard(card, event.playerSessionId, 'trash');
              }

              engine.addPowerModifier(
                event.sourceInstanceId,
                event.playerSessionId,
                player.zones.leader.instanceId,
                2000,
                'untilEndOfTurn',
              );

              engine.reapplyContinuousEffects();
            },
          );
        },
      );
    }
  },
};
