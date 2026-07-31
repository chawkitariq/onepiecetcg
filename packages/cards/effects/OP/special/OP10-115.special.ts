import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP10-115
 * [Trigger] K.O. up to 1 of your opponent's Characters with a cost less
 * than or equal to the number of your opponent's Life cards.
 */
export const op10115SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-115-special',
  cardId: 'OP10-115',
  resolve(event, engine) {
    if (event.type !== 'trigger') return;
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;
    const opponentSessionId = engine.getOpponentSessionId(event.playerSessionId);
    if (!opponentSessionId) return;
    const opponent = engine.getPlayer(opponentSessionId);
    if (!opponent) return;
    const oppLifeCount = opponent.zones.life.length;
    const targets = engine.getCards(
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], costMax: oppLifeCount },
        count: { kind: 'upTo', value: 1 },
      },
      event.playerSessionId,
    );
    for (const card of targets) {
      engine.koCharacter(card.ownerSessionId, card.instanceId, 'effect');
    }
    engine.syncPlayer(event.playerSessionId);
    engine.syncPlayer(opponentSessionId);
    engine.reapplyContinuousEffects();
  },
};
