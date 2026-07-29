import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * Handles Lindbergh because the trigger branch depends on a multicolored
 * leader, which the declarative DSL cannot express directly.
 */
export const op05017SpecialHandler: SpecialHandlerDefinition = {
  id: 'op05-017-special',
  cardId: 'OP05-017',
  resolve(event, engine) {
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    const leader = player?.zones.leader;

    if (!player || !leader) {
      return;
    }

    if (event.type === 'whenAttacking') {
      const source = host.getCard(event.sourceInstanceId);

      if (!source || source.power < 7000) {
        return;
      }

      const definition: StandardEffectDefinition = {
        id: 'lindbergh-017-when-attacking-power-7000-ko-cost-3000-or-less',
        text: "[When Attacking] If this Character has 7000 power or more, K.O. up to 1 of your opponent's Characters with 3000 power or less.",
        trigger: { type: 'whenAttacking' },
        actions: [
          {
            type: 'ko',
            selector: {
              player: 'opponent',
              zones: ['characters'],
              filter: { cardCategory: ['Character'], powerMax: 3000 },
              count: { kind: 'upTo', value: 1 },
            },
            reason: 'effect',
          },
        ],
      };

      engine.queueEffect(
        event.playerSessionId,
        event.sourceInstanceId,
        event.sourceCardId,
        definition,
      );
      return;
    }

    if (event.type !== 'trigger' || leader.colors.length < 2) {
      return;
    }

    const definition: StandardEffectDefinition = {
      id: 'lindbergh-017-trigger-trash-1-play-this-card-if-multicolored-leader',
      text: '[Trigger] You may trash 1 card from your hand: If your Leader is multicolored, play this card.',
      trigger: { type: 'trigger', optional: true },
      costs: [
        {
          type: 'trashFromHand',
          selector: {
            player: 'self',
            zones: ['hand'],
            count: { kind: 'exact', value: 1 },
          },
        },
      ],
      actions: [
        {
          type: 'play',
          selector: {
            player: 'self',
            source: 'effectSource',
            zones: ['trash'],
            count: { kind: 'exact', value: 1 },
          },
          destination: 'characters',
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
