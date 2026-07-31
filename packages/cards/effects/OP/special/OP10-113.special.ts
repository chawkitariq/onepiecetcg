import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP10-113
 * [Main] K.O. all Characters with a cost of 4 or more (both sides).
 */
export const op10113SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-113-special',
  cardId: 'OP10-113',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const allChars = engine.getCards(
      {
        player: 'either',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], costMin: 4 },
      },
      event.playerSessionId,
    );
    for (const card of allChars) {
      engine.koCharacter(card.ownerSessionId, card.instanceId, 'effect');
    }
    const oppId = engine.getOpponentSessionId(event.playerSessionId);
    engine.syncPlayer(event.playerSessionId);
    if (oppId) engine.syncPlayer(oppId);
    engine.reapplyContinuousEffects();
  },
};
