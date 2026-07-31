import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { createOncePerTurnKey } from '../../special-handler-utils.js';

/**
 * Handles Imu:
 * 1. Deck construction restriction (cannot include Events with cost >= 2) plus
 *    start-of-game search for [Mary Geoise] Stage card — both are structural and
 *    enforced at deck validation / game setup, not in the effect engine.
 * 2. [Activate: Main] [Once Per Turn] You may trash 1 of your [Celestial Dragons]
 *    type Characters or 1 card from your hand: Draw 1 card.
 */
export const op13079SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-079-special',
  cardId: 'OP13-079',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;

    const player = engine.getPlayer(event.playerSessionId);
    const source = engine.getCard(event.sourceInstanceId);
    if (!player || !source) return;

    if (
      engine.hasResolvedOncePerTurnKey(
        createOncePerTurnKey(
          event.sourceInstanceId,
          'op13-079',
          engine.state.turn,
        ),
      )
    )
      return;

    const hasCelestialDragons =
      engine.getCards(
        {
          player: 'self',
          zones: ['characters'],
          filter: {
            cardCategory: ['Character'],
            trait: ['Celestial Dragons'],
          },
          count: { kind: 'upTo', value: 1 },
        },
        event.playerSessionId,
      ).length > 0;

    if (!hasCelestialDragons && player.zones.hand.length < 1) return;

    engine.pauseDecision(
      {
        id: `${event.sourceInstanceId}:op13-079:confirm`,
        effectId: 'op13-079-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message:
            '[Imu] Trash 1 Celestial Dragons Character or 1 card from hand to draw 1?',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) return;

        engine.markResolvedOncePerTurnKey(
          createOncePerTurnKey(
            event.sourceInstanceId,
            'op13-079',
            engine.state.turn,
          ),
        );

        engine.chooseCards(
          `${event.sourceInstanceId}:op13-079:trash-cost`,
          event.playerSessionId,
          {
            sourceInstanceId: event.sourceInstanceId,
            storedSelections: {},
          },
          event.playerSessionId,
          '[Imu] Choose 1 Celestial Dragons Character or 1 card from hand to trash:',
          {
            player: 'self',
            zones: ['characters', 'hand'],
            filter: {
              cardCategory: ['Character'],
              trait: ['Celestial Dragons'],
            },
            count: { kind: 'exact', value: 1 },
          },
          undefined,
          (_trashed) => {
            for (const card of _trashed) {
              engine.moveCard(card, event.playerSessionId, 'trash');
            }

            const def: StandardEffectDefinition = {
              id: 'op13-079-draw',
              text: 'Draw 1 card.',
              trigger: { type: 'activateMain' },
              actions: [{ type: 'draw', player: 'self', amount: 1 }],
            };

            engine.queueEffect(
              event.playerSessionId,
              event.sourceInstanceId,
              event.sourceCardId,
              def,
            );
          },
        );
      },
    );
  },
};
