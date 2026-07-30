/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

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
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;
    const opponentSessionId = host.getOpponentSessionId(event.playerSessionId);
    if (!opponentSessionId) return;
    const opponent = host.getPlayer(opponentSessionId);
    if (!opponent) return;
    const oppLifeCount = opponent.zones.life.length;
    const targets = host.getCards(
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], costMax: oppLifeCount },
        count: { kind: 'upTo', value: 1 },
      },
      event.playerSessionId,
    );
    for (const card of targets) {
      host.koCharacter(card.ownerSessionId, card.instanceId, 'effect');
    }
    host.syncPlayer(event.playerSessionId);
    host.syncPlayer(opponentSessionId);
    engine.reapplyContinuousEffects();
  },
};
