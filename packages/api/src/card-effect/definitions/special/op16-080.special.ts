import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op16080SpecialHandler: SpecialHandlerDefinition = {
  id: 'op16-080-attack-redirect',
  cardId: 'OP16-080',
  resolve(_event, _engine) {
    // TODO: Implement special handler for OP16-080
    // [On your Opponent's Attack] [Once Per Turn] You may trash 1 card with
    // a [Trigger] from your hand: Change the target of that attack to this
    // Leader or to one of your {Blackbeard Pirates} type Character cards.
  },
};
