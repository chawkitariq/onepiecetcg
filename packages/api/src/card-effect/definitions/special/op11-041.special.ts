/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

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
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const turn = host.state.turn;

    if (event.type === 'onLifeDamageDealt') {
      const oncePerTurnKey = `${event.sourceInstanceId}:op11-041:draw:${turn}`;
      if (anyEngine.resolvedOncePerTurnKeys?.has(oncePerTurnKey)) return;

      const player = host.getPlayer(event.playerSessionId);
      if (!player) return;

      if (player.zones.hand.length > 7) return;

      anyEngine.resolvedOncePerTurnKeys?.add(oncePerTurnKey);

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
      if (anyEngine.resolvedOncePerTurnKeys?.has(oncePerTurnKey)) return;

      const player = host.getPlayer(event.playerSessionId);
      if (!player) return;

      const hasDonAttached = (player.zones.leader.attachedDon ?? 0) >= 1;
      if (!hasDonAttached) return;

      const handCards = host.getCards(
        {
          player: 'self',
          zones: ['hand'],
          count: { kind: 'upTo', value: 1 },
        },
        event.playerSessionId,
      );
      if (handCards.length === 0) return;

      anyEngine.decisions.pause(
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

          anyEngine.resolvedOncePerTurnKeys?.add(oncePerTurnKey);

          anyEngine.decisions.chooseCards(
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
                host.moveCard(card, event.playerSessionId, 'trash');
              }

              anyEngine.modifiers.addPowerModifier(
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
