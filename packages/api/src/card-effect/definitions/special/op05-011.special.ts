import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * Handles Bartholomew Kuma 011 because both branches depend on whether the
 * controller's leader is multicolored, which the declarative DSL cannot model.
 */
export const op05011SpecialHandler: SpecialHandlerDefinition = {
  id: 'op05-011-special',
  cardId: 'OP05-011',
  resolve(event, engine) {
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    const leader = player?.zones.leader;

    if (!player || !leader || leader.colors.length < 2) {
      return;
    }

    if (event.type === 'onPlay') {
      const definition: StandardEffectDefinition = {
        id: 'bartholomew-kuma-011-on-play-ko-cost-2000-or-less',
        text: "[On Play] K.O. up to 1 of your opponent's Characters with 2000 power or less.",
        trigger: { type: 'onPlay' },
        actions: [
          {
            type: 'ko',
            selector: {
              player: 'opponent',
              zones: ['characters'],
              filter: { cardCategory: ['Character'], powerMax: 2000 },
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

    if (event.type !== 'trigger') {
      return;
    }

    const definition: StandardEffectDefinition = {
      id: 'bartholomew-kuma-011-trigger-play-this-card-if-multicolored-leader',
      text: '[Trigger] If your Leader is multicolored, play this card.',
      trigger: { type: 'trigger' },
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
