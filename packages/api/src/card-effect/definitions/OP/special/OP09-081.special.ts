/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils';

/**
 * OP09-081 "Marshall.D.Teach (Parallel)"
 * Your [On Play] effects are negated.
 * [Activate: Main] You may trash 1 card from your hand: Your opponent's
 * [On Play] effects are negated until the end of your opponent's next turn.
 *
 * NOTE: The continuous "Your [On Play] effects are negated" effect needs to
 * be implemented as a continuous effect in op09.effects.ts — the special
 * handler cannot define persistent global state that affects other cards'
 * resolution windows. The duration "until the end of your opponent's next
 * turn" also requires turn-engine coordination beyond the handler scope.
 *
 * This handler implements the [Activate: Main] portion, setting the negated
 * flag on all opponent in-play cards.
 */
export const op09081SpecialHandler: SpecialHandlerDefinition = {
  id: 'op09-081-special',
  cardId: 'OP09-081',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;

    decisions.chooseCards(
      `${event.sourceInstanceId}:op09-081:trash-hand`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      "[Marshall.D.Teach] You may trash 1 card from your hand to negate opponent's [On Play] effects:",
      {
        player: 'self',
        zones: ['hand'],
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (cards) => {
        if (cards.length === 0) return;
        for (const card of cards) {
          host.moveCard(card, event.playerSessionId, 'trash');
        }

        const opponentSessionId = host.getOpponentSessionId(
          event.playerSessionId,
        );
        if (!opponentSessionId) return;
        const opponent = host.getPlayer(opponentSessionId);
        if (!opponent) return;

        const targets = [opponent.zones.leader, ...opponent.zones.characters];
        for (const target of targets) {
          if (target.instanceId) {
            patchSpecialHandlerCardStatus(host, target, {
              effectNegated: true,
            });
          }
        }
        host.syncPlayer(opponentSessionId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
