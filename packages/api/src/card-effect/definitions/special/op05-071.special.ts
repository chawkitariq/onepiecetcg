import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * Handles Bepo because the power debuff depends on comparing both players'
 * total DON!! counts, which the declarative DSL cannot express yet.
 */
export const op05071SpecialHandler: SpecialHandlerDefinition = {
  id: 'op05-071-special',
  cardId: 'OP05-071',
  resolve(event, engine) {
    if (event.type !== 'whenAttacking') {
      return;
    }

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    const opponentId = host.getOpponentSessionId(event.playerSessionId);
    const opponent = opponentId ? host.getPlayer(opponentId) : undefined;

    if (!player || !opponent) {
      return;
    }

    const playerDon =
      player.zones.cost.length +
      player.zones.leader.attachedDon +
      player.zones.characters.reduce((sum: number, card: { attachedDon: number }) => sum + card.attachedDon, 0);
    const opponentDon =
      opponent.zones.cost.length +
      opponent.zones.leader.attachedDon +
      opponent.zones.characters.reduce((sum: number, card: { attachedDon: number }) => sum + card.attachedDon, 0);

    if (opponentDon <= playerDon) {
      return;
    }

    const definition: StandardEffectDefinition = {
      id: 'bepo-071-when-attacking-opponent-has-more-don-minus-2000',
      text: "[When Attacking] If your opponent has more DON!! cards on their field than you, give up to 1 of your opponent's Characters -2000 power during this turn.",
      trigger: { type: 'whenAttacking' },
      actions: [
        {
          type: 'modifyPower',
          selector: {
            player: 'opponent',
            zones: ['characters'],
            filter: { cardCategory: ['Character'] },
            count: { kind: 'upTo', value: 1 },
          },
          amount: -2000,
          duration: { type: 'untilEndOfTurn' },
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
