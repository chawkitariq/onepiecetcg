import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

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
    const source = engine.getCard(event.sourceInstanceId);
    if (!source) return;
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;
    const attachedDon = engine.getCards(
      {
        player: 'self',
        zones: ['cost'],
        filter: { attachedTo: event.sourceInstanceId } as any,
      },
      event.playerSessionId,
    );
    if (attachedDon.length < 1) return;
    const leader = (player as any).leader;
    if (!leader || !leader.families?.includes('Supernovas')) return;
    const opponentSessionId = engine.getOpponentSessionId(event.playerSessionId);
    if (!opponentSessionId) return;
    const opponent = engine.getPlayer(opponentSessionId);
    if (!opponent) return;
    if (opponent.zones.life.length < 3) return;
    engine.addKeywordModifier(
      event.sourceInstanceId,
      event.playerSessionId,
      source.instanceId,
      ['cannotBeKoedInBattle'],
      'untilEndOfTurn',
    );
    engine.reapplyContinuousEffects();
  },
};
