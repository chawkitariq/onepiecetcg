/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

/**
 * OP09-098 "Black Hole"
 * [Main] If your Leader has the "Blackbeard Pirates" type, negate the effect
 *   of up to 1 of your opponent's Characters during this turn. Then, if that
 *   Character has a cost of 4 or less, K.O. it.
 * [Trigger] Negate the effect of up to 1 of your opponent's Leader or
 *   Character cards during this turn.
 */
export const op09098SpecialHandler: SpecialHandlerDefinition = {
  id: 'op09-098-special',
  cardId: 'OP09-098',
  resolve(event, engine) {
    if (event.type === 'activateMain') {
      const anyEngine = engine as any;
      const host = anyEngine.host;
      const decisions = anyEngine.decisions;
      const player = host.getPlayer(event.playerSessionId);
      if (!player) return;

      const leader = player.zones.leader;
      if (!leader || !leader.families?.includes('Blackbeard Pirates')) {
        return;
      }

      decisions.chooseCards(
        `${event.sourceInstanceId}:op09-098:main`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        "[Black Hole] Negate up to 1 of your opponent's Characters during this turn:",
        {
          player: 'opponent',
          zones: ['characters'],
          filter: { cardCategory: ['Character'] },
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        (cards) => {
          for (const card of cards) {
            card.effectNegated = true;
            if ((card.baseCost ?? card.cost ?? 0) <= 4) {
              host.koCharacter(card.ownerSessionId, card.instanceId, 'effect');
            }
          }
          host.syncPlayer(event.playerSessionId);
          const opponentSessionId = host.getOpponentSessionId(
            event.playerSessionId,
          );
          if (opponentSessionId) {
            host.syncPlayer(opponentSessionId);
          }
          engine.reapplyContinuousEffects();
        },
      );
    } else if (event.type === 'trigger') {
      const anyEngine = engine as any;
      const host = anyEngine.host;
      const decisions = anyEngine.decisions;

      decisions.chooseCards(
        `${event.sourceInstanceId}:op09-098:trigger`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        "[Black Hole] Negate the effect of up to 1 of your opponent's Leader or Character cards during this turn:",
        {
          player: 'opponent',
          zones: ['leader', 'characters'],
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        (cards) => {
          for (const card of cards) {
            card.effectNegated = true;
          }
          host.syncPlayer(event.playerSessionId);
          const opponentSessionId = host.getOpponentSessionId(
            event.playerSessionId,
          );
          if (opponentSessionId) {
            host.syncPlayer(opponentSessionId);
          }
          engine.reapplyContinuousEffects();
        },
      );
    }
  },
};
