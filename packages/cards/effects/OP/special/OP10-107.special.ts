/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP10-107
 * [On Play] Give up to 1 DON!! card from your DON!! deck (rested) to
 * your Leader or 1 of your Characters. The number of DON!! cards you
 * may give is equal to the difference between the number of your Life
 * cards and your opponent's Life cards.
 */
export const op10107SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-107-special',
  cardId: 'OP10-107',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;
    const opponentSessionId = host.getOpponentSessionId(event.playerSessionId);
    if (!opponentSessionId) return;
    const opponent = host.getPlayer(opponentSessionId);
    if (!opponent) return;
    const lifeDiff = Math.abs(
      player.zones.life.length - opponent.zones.life.length,
    );
    if (lifeDiff === 0) {
      engine.reapplyContinuousEffects();
      return;
    }
    decisions.chooseCards(
      `${event.sourceInstanceId}:op10-107:attach-don`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      `Give up to ${lifeDiff} DON!! to your Leader or Character:`,
      {
        player: 'self',
        zones: ['leader', 'characters'],
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (targets) => {
        const target = targets[0];
        if (!target) {
          engine.reapplyContinuousEffects();
          return;
        }
        decisions.chooseChoices(
          `${event.sourceInstanceId}:op10-107:don-amount`,
          event.playerSessionId,
          `Give how many DON!!? (up to ${lifeDiff})`,
          Array.from({ length: lifeDiff + 1 }, (_, i) => ({
            id: String(i),
            label: `${i} DON!!`,
          })),
          1,
          1,
          (choiceIds) => {
            const amount = parseInt(choiceIds[0], 10);
            if (amount > 0) {
              host.attachDon(event.playerSessionId, target.instanceId, amount);
              host.syncPlayer(event.playerSessionId);
            }
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
