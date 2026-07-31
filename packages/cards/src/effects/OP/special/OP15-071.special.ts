import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP15-071 "Holly"
 * All of your [Ohm] cards and this Character gain [Double Attack].
 * [Opponent's Turn] All of your [Ohm] cards' base power and this Character's
 * base power become 6000.
 */
export const op15071SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-071-special',
  cardId: 'OP15-071',
  resolve(event, engine) {
    if (event.type !== 'onTurnStart') return;

    const source = engine.getCard(event.sourceInstanceId);
    if (!source) return;

    // On the opponent's turn, set base power to 6000 for all [Ohm] cards
    // and this Character.
    if (event.playerSessionId !== source.ownerSessionId) {
      const ohmCards = engine.getCards(
        {
          player: 'self',
          zones: ['characters', 'leader'],
          filter: { trait: ['Ohm'] },
          count: { kind: 'any' },
        },
        source.ownerSessionId,
      );

      for (const card of ohmCards) {
        const delta = 6000 - (card.basePower > 0 ? card.basePower : card.power);
        engine.addPowerModifier(
          event.sourceInstanceId,
          source.ownerSessionId,
          card.instanceId,
          delta,
          'untilStartOfYourNextTurn',
        );
      }
    }

    engine.reapplyContinuousEffects();
  },
};
