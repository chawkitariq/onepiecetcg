/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';
import {
  createOncePerTurnKey,
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
} from '../../special-handler-utils';

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
      const anyEngine = engine as any;
      const { host, decisions } = anyEngine;
      const source = host.getCard(event.sourceInstanceId);
      if (!source || !source.rested) return;
      const activePlayerSessionId = host.state.activePlayerSessionId;
      if (activePlayerSessionId !== event.playerSessionId) return;

      decisions.chooseCards(
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
            card.skipNextRefreshPhases = (card.skipNextRefreshPhases || 0) + 1;
          }
          host.syncPlayer(event.playerSessionId);
          engine.reapplyContinuousEffects();
        },
      );
    } else if (event.type === 'onAttacked') {
      const anyEngine = engine as any;
      const { host, decisions } = anyEngine;
      const turn = host.state.turn;
      if (
        hasResolvedOncePerTurn(
          anyEngine,
          event.sourceInstanceId,
          'op14-119',
          turn,
        )
      )
        return;

      decisions.chooseCards(
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
          markResolvedOncePerTurn(
            anyEngine,
            event.sourceInstanceId,
            'op14-119',
            turn,
          );
          for (const card of trashed) {
            host.moveCard(card, event.playerSessionId, 'trash');
          }

          decisions.chooseCards(
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
                anyEngine.modifiers.addPowerModifier(
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
