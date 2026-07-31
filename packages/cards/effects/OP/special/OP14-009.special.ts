/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import {
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
} from '../../special-handler-utils.js';

/**
 * OP14-009 Trafalgar Law (Alternate Art)
 * [Rush]
 * [On Your Opponent's Attack] [Once Per Turn] You may trash 2 cards from your
 * hand: Select your Leader and 1 Character. Swap the base power of the selected
 * cards with each other during this battle.
 */
export const op14009SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-009-special',
  cardId: 'OP14-009',
  resolve(event, engine) {
    if (event.type !== 'onAttacked') return;
    const anyEngine = engine as any;
    const { host, decisions } = anyEngine;
    const turn = host.state.turn;
    if (
      hasResolvedOncePerTurn(
        anyEngine,
        event.sourceInstanceId,
        'op14-009',
        turn,
      )
    )
      return;

    decisions.chooseCards(
      `${event.sourceInstanceId}:op14-009:trash-hand`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Trafalgar Law] You may trash 2 cards from your hand to swap base power of Leader and 1 Character:',
      {
        player: 'self',
        zones: ['hand'],
        count: { kind: 'upTo', value: 2 },
      },
      undefined,
      (trashed) => {
        if (trashed.length < 2) return;
        for (const card of trashed) {
          host.moveCard(card, event.playerSessionId, 'trash');
        }
        markResolvedOncePerTurn(
          anyEngine,
          event.sourceInstanceId,
          'op14-009',
          turn,
        );

        decisions.chooseCards(
          `${event.sourceInstanceId}:op14-009:select-character`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          '[Trafalgar Law] Select 1 of your Characters (besides Leader) to swap base power with Leader:',
          {
            player: 'self',
            zones: ['characters'],
            filter: { cardCategory: ['Character'] },
            count: { kind: 'exact', value: 1 },
          },
          undefined,
          (chars) => {
            if (chars.length < 1) return;
            const character = chars[0];
            const p = host.getPlayer(event.playerSessionId);
            const leader = p?.zones.leader;
            if (!leader || !leader.instanceId) return;
            const pLeader = leader.basePower;
            const pChar = character.basePower;
            anyEngine.modifiers.addPowerModifier(
              event.sourceInstanceId,
              event.playerSessionId,
              leader.instanceId,
              pChar - pLeader,
              'untilEndOfBattle',
            );
            anyEngine.modifiers.addPowerModifier(
              event.sourceInstanceId,
              event.playerSessionId,
              character.instanceId,
              pLeader - pChar,
              'untilEndOfBattle',
            );
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
