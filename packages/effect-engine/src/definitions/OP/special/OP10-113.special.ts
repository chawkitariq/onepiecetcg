/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

/**
 * OP10-113
 * [Main] K.O. all Characters with a cost of 4 or more (both sides).
 */
export const op10113SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-113-special',
  cardId: 'OP10-113',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const allChars = host.getCards(
      {
        player: 'either',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], costMin: 4 },
      },
      event.playerSessionId,
    );
    for (const card of allChars) {
      host.koCharacter(card.ownerSessionId, card.instanceId, 'effect');
    }
    const oppId = host.getOpponentSessionId(event.playerSessionId);
    host.syncPlayer(event.playerSessionId);
    if (oppId) host.syncPlayer(oppId);
    engine.reapplyContinuousEffects();
  },
};
