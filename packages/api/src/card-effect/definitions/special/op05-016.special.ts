import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * Handles Morley because the attack-time Blocker lock depends on the current
 * power threshold and the trigger branch depends on a multicolored leader.
 */
export const op05016SpecialHandler: SpecialHandlerDefinition = {
  id: 'op05-016-special',
  cardId: 'OP05-016',
  resolve(event, engine) {
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    const leader = player?.zones.leader;
    const source = host.getCard(event.sourceInstanceId);

    if (!player || !leader || !source) {
      return;
    }

    if (event.type === 'whenAttacking') {
      if (source.power < 7000) {
        return;
      }

      const definition: StandardEffectDefinition = {
        id: 'morley-016-when-attacking-power-7000-plus-cannot-block',
        text: "If this Character has 7000 power or more, your opponent cannot activate [Blocker] during this battle.",
        trigger: { type: 'whenAttacking' },
        actions: [
          {
            type: 'grantKeywords',
            selector: {
              player: 'opponent',
              zones: ['characters'],
              filter: { cardCategory: ['Character'] },
            },
            keywords: ['cannotBlock'],
            duration: { type: 'untilEndOfBattle' },
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

    if (event.type !== 'trigger') {
      return;
    }

    if (leader.colors.length < 2) {
      return;
    }

    const definition: StandardEffectDefinition = {
      id: 'morley-016-trigger-play-this-card-if-multicolored-leader',
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
