import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP10-030
 * [Activate: Main] Set up to 1 DON!! card from your DON!! deck as active.
 * Then, you cannot set DON!! cards as active using Character effects
 * during this turn.
 *
 * NOTE: The "cannot set DON!! active using Character effects" restriction
 * needs to be enforced by the duel room — there is currently no runtime
 * player-restriction type for this specific constraint.
 */
export const op10030SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-030-special',
  cardId: 'OP10-030',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;
    engine.chooseChoices(
      `${event.sourceInstanceId}:op10-030:don-amount`,
      event.playerSessionId,
      'Set 0 or 1 DON!! active?',
      [
        { id: '0', label: '0 DON!!' },
        { id: '1', label: '1 DON!!' },
      ],
      1,
      1,
      (choiceIds) => {
        const amount = parseInt(choiceIds[0], 10);
        if (amount > 0) {
          engine.addDonToCost(event.playerSessionId, 1, false);
        }
        engine.addLog(
          '[OP10-030] Cannot set DON!! active using Character effects this turn.',
        );
        engine.syncPlayer(event.playerSessionId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
