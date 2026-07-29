import type { DuelCard } from '@onepiecetcg/shared';

import type { SpecialHandlerDefinition } from '../../types/effect-registry';

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

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    const source = host.getCard(event.sourceInstanceId);

    if (!player || !source) {
      return;
    }

    if (player.zones.cost.length < 10) {
      return;
    }

    host.returnDonToDonDeck(event.playerSessionId, 10);

    const characters: DuelCard[] = Array.from(player.zones.characters);

    for (const target of characters) {
      if (target.instanceId === source.instanceId) {
        continue;
      }

      host.moveCard(target, event.playerSessionId, 'deck', { toBottom: true });
    }

    host.state.pendingExtraTurnSessionId = event.playerSessionId;
  },
};
