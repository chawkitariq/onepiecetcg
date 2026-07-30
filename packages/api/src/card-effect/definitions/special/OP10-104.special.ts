/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP10-104
 * [DON!! x1] If your Leader is {Supernovas} type and your opponent has
 * 3 or more Life cards, this card cannot be K.O.'d in battle.
 *
 * NOTE: This handler runs on `whenAttacking` and `onTurnStart` to
 * re-apply the `cannotBeKoedInBattle` keyword modifier while the
 * condition holds. The modifier expires at end of turn, so it must
 * be reapplied each turn.
 */
export const op10104SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-104-special',
  cardId: 'OP10-104',
  resolve(event, engine) {
    if (event.type !== 'whenAttacking' && event.type !== 'onTurnStart') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;
    const attachedDon = host.getCards(
      {
        player: 'self',
        zones: ['cost'],
        filter: { attachedTo: event.sourceInstanceId },
      },
      event.playerSessionId,
    );
    if (attachedDon.length < 1) return;
    const leader = player.leader;
    if (!leader || !leader.families?.includes('Supernovas')) return;
    const opponentSessionId = host.getOpponentSessionId(event.playerSessionId);
    if (!opponentSessionId) return;
    const opponent = host.getPlayer(opponentSessionId);
    if (!opponent) return;
    if (opponent.zones.life.length < 3) return;
    anyEngine.modifiers.addKeywordModifier(
      event.sourceInstanceId,
      event.playerSessionId,
      source.instanceId,
      ['cannotBeKoedInBattle'],
      'untilEndOfTurn',
    );
    engine.reapplyContinuousEffects();
  },
};
