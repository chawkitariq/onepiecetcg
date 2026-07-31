import type { DuelCard } from '@onepiecetcg/shared';

import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * Handles the DON!! -10 branch on Monkey.D.Luffy because the current card DSL
 * does not model extra turns directly.
 */
export const op05119SpecialHandler: SpecialHandlerDefinition = {
  id: 'op05-119-special',
  cardId: 'OP05-119',
  resolve(event, engine) {
    if (event.type !== 'onPlay') {
      return;
    }

    const player = engine.getPlayer(event.playerSessionId);
    const source = engine.getCard(event.sourceInstanceId);

    if (!player || !source) {
      return;
    }

    if (player.zones.cost.length < 10) {
      return;
    }

    engine.returnDonToDonDeck(event.playerSessionId, 10);

    const characters: DuelCard[] = Array.from(player.zones.characters);

    for (const target of characters) {
      if (target.instanceId === source.instanceId) {
        continue;
      }

      engine.moveCard(target, event.playerSessionId, 'deck', { toBottom: true });
    }

    engine.state.pendingExtraTurnSessionId = event.playerSessionId;
  },
};
