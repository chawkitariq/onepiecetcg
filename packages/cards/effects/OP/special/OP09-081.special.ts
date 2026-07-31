import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils.js';

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

    engine.chooseCards(
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
          engine.moveCard(card, event.playerSessionId, 'trash');
        }

        const opponentSessionId = engine.getOpponentSessionId(
          event.playerSessionId,
        );
        if (!opponentSessionId) return;
        const opponent = engine.getPlayer(opponentSessionId);
        if (!opponent) return;

        const targets = [opponent.zones.leader, ...opponent.zones.characters];
        for (const target of targets) {
          if (target.instanceId) {
            patchSpecialHandlerCardStatus(engine, target, {
              effectNegated: true,
            });
          }
        }
        engine.syncPlayer(opponentSessionId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
