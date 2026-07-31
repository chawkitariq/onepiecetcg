import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP15-092 "Monkey.D.Luffy (OP15-092)"
 * Apply each of the following effects based on the number of cards in your
 * trash:
 *   - If there are 10 or more cards, this Character's base power becomes 9000
 *     and it gains +10 cost.
 *   - If you have 20 or more cards, during your opponent's turn, your Leader's
 *     base power becomes 7000.
 *   - If you have 30 or more cards, this Character gains +1000 power.
 *
 * The first and third bullets are continuous effects defined in the edition
 * definition file.  This handler covers the second bullet (opponent-turn
 * Leader base power = 7000) which requires turn-awareness.
 */
export const op15092SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-092-special',
  cardId: 'OP15-092',
  resolve(event, engine) {
    if (event.type !== 'onTurnStart') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const modifiers = anyEngine.modifiers;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    // Opponent's turn: check if controller has 20+ cards in trash
    if (event.playerSessionId === source.ownerSessionId) return;

    const player = host.getPlayer(source.ownerSessionId);
    if (!player) return;

    const trashCount = player.zones.trash.length;
    if (trashCount < 20) return;

    const leader = player.zones.leader;
    if (!leader.instanceId) return;

    const delta =
      7000 - (leader.basePower > 0 ? leader.basePower : leader.power);
    modifiers.addPowerModifier(
      event.sourceInstanceId,
      source.ownerSessionId,
      leader.instanceId,
      delta,
      'untilStartOfYourNextTurn',
    );

    engine.reapplyContinuousEffects();
  },
};
