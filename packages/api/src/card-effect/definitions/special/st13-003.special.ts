import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * Monkey.D.Luffy (ST13-003) Leader special handler.
 *
 * Your face-up Life cards are placed at the bottom of your deck instead of
 * being added to your hand, according to the rules.
 *
 * [DON!! x2][Activate: Main][Once Per Turn] You may trash 1 card from your
 * hand: If you have 0 Life cards, add up to 2 Character cards with a cost of
 * 5 from your hand or trash to the top of your Life cards face-up.
 */
export const st13003SpecialHandler: SpecialHandlerDefinition = {
  id: 'st13-003-special',
  cardId: 'ST13-003',
  resolve(_event, _engine) {
    // TODO: Implement special handler logic
  },
};
