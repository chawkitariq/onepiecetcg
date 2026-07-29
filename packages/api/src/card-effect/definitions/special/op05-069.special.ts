import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * Handles Trafalgar Law 069 because the leader-multicolor condition is not a
 * native DSL predicate, while the rest of the card maps cleanly to a search.
 */
export const op05069SpecialHandler: SpecialHandlerDefinition = {
  id: 'op05-069-special',
  cardId: 'OP05-069',
  resolve(event, engine) {
    if (event.type !== 'whenAttacking') {
      return;
    }

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    const leader = player?.zones.leader;
    const opponentId = host.getOpponentSessionId(event.playerSessionId);
    const opponent = opponentId ? host.getPlayer(opponentId) : undefined;

    if (!player || !leader || leader.colors.length < 2 || !opponent) {
      return;
    }

    const playerDon =
      player.zones.cost.length +
      player.zones.leader.attachedDon +
      player.zones.characters.reduce(
        (sum: number, card: { attachedDon: number }) => sum + card.attachedDon,
        0,
      );
    const opponentDon =
      opponent.zones.cost.length +
      opponent.zones.leader.attachedDon +
      opponent.zones.characters.reduce(
        (sum: number, card: { attachedDon: number }) => sum + card.attachedDon,
        0,
      );

    if (opponentDon <= playerDon) {
      return;
    }

    const definition: StandardEffectDefinition = {
      id: 'trafalgar-law-069-when-attacking-opponent-has-more-don-search-heart-pirates',
      text: "[When Attacking] If your opponent has more DON!! cards on their field than you, look at 5 cards from the top of your deck; reveal up to 1 [Heart Pirates] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.",
      trigger: { type: 'whenAttacking' },
      actions: [
        {
          type: 'search',
          player: 'self',
          sourceZone: 'deck',
          amount: 5,
          filter: { trait: ['Heart Pirates'] },
          count: { kind: 'upTo', value: 1 },
          destination: 'hand',
          restDestination: 'deck',
          restToBottom: true,
        },
      ],
    };

    engine.queueEffect(
      event.playerSessionId,
      event.sourceInstanceId,
      event.sourceCardId,
      definition,
    );
  },
};
