import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import {
  createOncePerTurnKey,
  patchSpecialHandlerCardStatus,
} from '../../special-handler-utils.js';

/**
 * OP14-119 Dracule Mihawk (Alternate Art)
 * [Your Turn] When this Character becomes rested, up to 1 of your opponent's
 * Characters with a cost of 9 or less cannot be rested until the end of your
 * opponent's next End Phase.
 * [On Your Opponent's Attack] [Once Per Turn] You may trash 1 card from your
 * hand: Up to 1 of your Leader or Character cards gains +2000 power during
 * this battle.
 */
export const op14119SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-119-special',
  cardId: 'OP14-119',
  resolve(event, engine) {
    if (event.type === 'onDonAttached' || event.type === 'onPlay') {
      const source = engine.getCard(event.sourceInstanceId);
      if (!source || !source.rested) return;
      const activePlayerSessionId = engine.state.activePlayerSessionId;
      if (activePlayerSessionId !== event.playerSessionId) return;

      engine.chooseCards(
        `${event.sourceInstanceId}:op14-119:prevent-rest`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        "[Dracule Mihawk] Select up to 1 opponent Character (cost 9 or less) — they cannot be rested until end of opponent's next End Phase:",
        {
          player: 'opponent',
          zones: ['characters'],
          filter: { cardCategory: ['Character'], costMax: 9 },
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        (selected) => {
          for (const card of selected) {
            patchSpecialHandlerCardStatus(engine, card, {
              skipNextRefreshPhases: (card.skipNextRefreshPhases || 0) + 1,
            });
          }
          engine.syncPlayer(event.playerSessionId);
          engine.reapplyContinuousEffects();
        },
      );
    } else if (event.type === 'onAttacked') {
      const turn = engine.state.turn;
      if (
        engine.hasResolvedOncePerTurnKey(
          createOncePerTurnKey(event.sourceInstanceId, 'op14-119', turn),
        )
      )
        return;

      engine.chooseCards(
        `${event.sourceInstanceId}:op14-119:trash-hand`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        '[Dracule Mihawk] Trash 1 card from your hand to give +2000 power to 1 of your Leader or Characters during this battle:',
        {
          player: 'self',
          zones: ['hand'],
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        (trashed) => {
          if (!trashed.length) return;
          engine.markResolvedOncePerTurnKey(
            createOncePerTurnKey(event.sourceInstanceId, 'op14-119', turn),
          );
          for (const card of trashed) {
            engine.moveCard(card, event.playerSessionId, 'trash');
          }

          engine.chooseCards(
            `${event.sourceInstanceId}:op14-119:power-up`,
            event.playerSessionId,
            { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
            event.playerSessionId,
            '[Dracule Mihawk] Choose up to 1 of your Leader or Character cards to gain +2000 power during this battle:',
            {
              player: 'self',
              zones: ['leader', 'characters'],
              count: { kind: 'upTo', value: 1 },
            },
            undefined,
            (selected) => {
              for (const card of selected) {
                engine.addPowerModifier(
                  event.sourceInstanceId,
                  event.playerSessionId,
                  card.instanceId,
                  2000,
                  'untilEndOfBattle',
                );
              }
              engine.reapplyContinuousEffects();
            },
          );
        },
      );
    }
  },
};
