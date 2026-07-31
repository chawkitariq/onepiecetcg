import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { createOncePerTurnKey } from '../../special-handler-utils.js';

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
    const turn = engine.state.turn;
    if (
      engine.hasResolvedOncePerTurnKey(
        createOncePerTurnKey(event.sourceInstanceId, 'op14-060', turn),
      )
    )
      return;

    const activeDon = engine.getCards(
      { player: 'self', zones: ['cost'], filter: { rested: false } },
      event.playerSessionId,
    );
    if (!activeDon.length) return;

    engine.pauseDecision(
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
        engine.markResolvedOncePerTurnKey(
          createOncePerTurnKey(event.sourceInstanceId, 'op14-060', turn),
        );

        const donToReturn = engine.getCards(
          { player: 'self', zones: ['cost'], filter: { rested: false } },
          event.playerSessionId,
        );
        if (donToReturn.length) {
          engine.returnDonToDonDeck(event.playerSessionId, 1);
        }

        engine.chooseCards(
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
            engine.state.combat.targetInstanceId = target.instanceId;
            engine.state.combat.targetType =
              target.type === 'Leader' ? 'leader' : 'character';
            engine.syncPlayer(event.playerSessionId);
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
