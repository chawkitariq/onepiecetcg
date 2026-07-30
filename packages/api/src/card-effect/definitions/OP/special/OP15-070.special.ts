import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

/**
 * OP15-070 "Fuza"
 * All of your [Shura] cards and this Character gain [Unblockable].
 * [Opponent's Turn] All of your [Shura] cards' base power and this Character's
 * base power become 6000.
 */
export const op15070SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-070-special',
  cardId: 'OP15-070',
  resolve(event, engine) {
    if (event.type !== 'onTurnStart') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const modifiers = anyEngine.modifiers;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    // On the opponent's turn, set base power to 6000 for all [Shura] cards
    // and this Character.
    if (event.playerSessionId !== source.ownerSessionId) {
      const shuraCards = host.getCards(
        {
          player: 'self',
          zones: ['characters', 'leader'],
          filter: { trait: ['Shura'] },
          count: { kind: 'any' },
        },
        source.ownerSessionId,
      );

      for (const card of shuraCards) {
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
