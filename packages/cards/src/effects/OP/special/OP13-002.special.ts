/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { createOncePerTurnKey } from '../../special-handler-utils.js';

/**
 * Handles Portgas.D.Ace (002):
 * 1. [On Your Opponent's Attack] [Once Per Turn] You may trash 1 card from your hand:
 *    Give up to 1 of your opponent's Leader or Character cards -2000 power during this battle.
 * 2. [DON!! x1] [Once Per Turn] When you take damage or your Character with 6000 base power
 *    or more is K.O.'d, draw 1 card.
 */
export const op13002SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-002-special',
  cardId: 'OP13-002',
  resolve(event, engine) {
    const source = engine.getCard(event.sourceInstanceId);
    if (!source) return;

    if (event.type === 'onAttacked') {
      if (
        engine.hasResolvedOncePerTurnKey(
          createOncePerTurnKey(
            event.sourceInstanceId,
            'op13-002-attack',
            engine.state.turn,
          ),
        )
      )
        return;

      const player = engine.getPlayer(event.playerSessionId);
      if (!player || player.zones.hand.length < 1) return;

      engine.pauseDecision(
        {
          id: `${event.sourceInstanceId}:op13-002:confirm`,
          effectId: 'op13-002-special',
          effectCardId: event.sourceCardId,
          sourceInstanceId: event.sourceInstanceId,
          playerSessionId: event.playerSessionId,
          createdAt: new Date().toISOString(),
          prompt: {
            type: 'confirm',
            message:
              '[Portgas.D.Ace 002] Trash 1 card from hand to give -2000 power?',
            optional: true,
          },
        },
        (response: { confirmed?: boolean }) => {
          if (!response.confirmed) return;

          engine.chooseCards(
            `${event.sourceInstanceId}:op13-002:trash-hand`,
            event.playerSessionId,
            {
              sourceInstanceId: event.sourceInstanceId,
              storedSelections: {},
            },
            event.playerSessionId,
            '[Portgas.D.Ace 002] Choose 1 card to trash:',
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

              engine.markResolvedOncePerTurnKey(
                createOncePerTurnKey(
                  event.sourceInstanceId,
                  'op13-002-attack',
                  engine.state.turn,
                ),
              );

              engine.chooseCards(
                `${event.sourceInstanceId}:op13-002:power-target`,
                event.playerSessionId,
                {
                  sourceInstanceId: event.sourceInstanceId,
                  storedSelections: {},
                },
                event.playerSessionId,
                '[Portgas.D.Ace 002] Choose up to 1 opponent Leader or Character to give -2000 power:',
                {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  filter: { cardCategory: ['Leader', 'Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                undefined,
                (targets) => {
                  for (const target of targets) {
                    engine.addPowerModifier(
                      event.sourceInstanceId,
                      event.playerSessionId,
                      target.instanceId,
                      -2000,
                      'untilEndOfBattle',
                    );
                  }
                  engine.reapplyContinuousEffects();
                },
              );
            },
          );
        },
      );
      return;
    }

    if (
      (event.type === 'onLifeDamageDealt' || event.type === 'onKo') &&
      source.attachedDon >= 1
    ) {
      if (
        engine.hasResolvedOncePerTurnKey(
          createOncePerTurnKey(
            event.sourceInstanceId,
            'op13-002-draw',
            engine.state.turn,
          ),
        )
      )
        return;

      if (event.type === 'onKo') {
        const koEvent = event as any;
        const koedCard = engine.getCard(koEvent.targetInstanceId);
        if (
          !koedCard ||
          koedCard.ownerSessionId !== event.playerSessionId ||
          ((koedCard as any).category !== 'Character' &&
            (koedCard as any).cardType !== 'Character') ||
          (koedCard.basePower ?? koedCard.power) < 6000
        )
          return;
      }

      engine.markResolvedOncePerTurnKey(
        createOncePerTurnKey(
          event.sourceInstanceId,
          'op13-002-draw',
          engine.state.turn,
        ),
      );

      const def: StandardEffectDefinition = {
        id: 'op13-002-draw',
        text: '[DON!! x1] [Once Per Turn] Draw 1 card.',
        trigger: { type: event.type },
        actions: [{ type: 'draw', player: 'self', amount: 1 }],
      };

      engine.queueEffect(
        event.playerSessionId,
        event.sourceInstanceId,
        event.sourceCardId,
        def,
      );
    }
  },
};
