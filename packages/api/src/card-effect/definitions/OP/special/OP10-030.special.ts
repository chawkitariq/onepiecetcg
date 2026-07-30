/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

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
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;
    decisions.chooseChoices(
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
          host.addDonToCost(event.playerSessionId, 1, false);
        }
        host.addLog(
          '[OP10-030] Cannot set DON!! active using Character effects this turn.',
        );
        host.syncPlayer(event.playerSessionId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
