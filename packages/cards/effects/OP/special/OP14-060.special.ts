/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import {
  createOncePerTurnKey,
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
} from '../../special-handler-utils.js';

/**
 * OP14-060 Donquixote Doflamingo (Alternate Art)
 * [On Your Opponent's Attack] [Once Per Turn] DON!! -1: Select your Leader or
 * 1 of your {Donquixote Pirates} type Characters. Change the attack target to
 * the selected card.
 */
export const op14060SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-060-special',
  cardId: 'OP14-060',
  resolve(event, engine) {
    if (event.type !== 'onAttacked') return;
    const anyEngine = engine as any;
    const { host, decisions } = anyEngine;
    const turn = host.state.turn;
    if (
      hasResolvedOncePerTurn(
        anyEngine,
        event.sourceInstanceId,
        'op14-060',
        turn,
      )
    )
      return;

    const activeDon = host.getCards(
      { player: 'self', zones: ['cost'], filter: { rested: false } },
      event.playerSessionId,
    );
    if (!activeDon.length) return;

    decisions.pause(
      {
        id: `${event.sourceInstanceId}:op14-060:pay-don`,
        effectId: 'op14-060-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message: '[Doflamingo] DON!! -1 to redirect attack?',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) return;
        markResolvedOncePerTurn(
          anyEngine,
          event.sourceInstanceId,
          'op14-060',
          turn,
        );

        const donToReturn = host.getCards(
          { player: 'self', zones: ['cost'], filter: { rested: false } },
          event.playerSessionId,
        );
        if (donToReturn.length) {
          host.returnDonToDonDeck(event.playerSessionId, 1);
        }

        decisions.chooseCards(
          `${event.sourceInstanceId}:op14-060:select-target`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          '[Doflamingo] Select your Leader or 1 {Donquixote Pirates} Character to redirect the attack to:',
          {
            player: 'self',
            zones: ['leader', 'characters'],
            filter: {
              cardCategory: ['Leader', 'Character'],
              trait: ['Donquixote Pirates'],
            },
            count: { kind: 'exact', value: 1 },
          },
          undefined,
          (selected) => {
            if (!selected.length) return;
            const target = selected[0];
            host.state.combat.targetInstanceId = target.instanceId;
            host.state.combat.targetType =
              target.type === 'Leader' ? 'leader' : 'character';
            host.syncPlayer(event.playerSessionId);
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
