import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

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

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const modifiers = anyEngine.modifiers;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    // On the opponent's turn, set base power to 6000 for all [Ohm] cards
    // and this Character.
    if (event.playerSessionId !== source.ownerSessionId) {
      const ohmCards = host.getCards(
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
        modifiers.addPowerModifier(
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
