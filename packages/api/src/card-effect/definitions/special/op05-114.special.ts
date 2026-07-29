import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * Handles El Thor because the counter branch needs to stack both power boosts
 * onto the same chosen card, and the trigger branch reads a dynamic life cap.
 */
export const op05114SpecialHandler: SpecialHandlerDefinition = {
  id: 'op05-114-special',
  cardId: 'OP05-114',
  resolve(event, engine) {
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const opponentId = host.getOpponentSessionId(event.playerSessionId);
    const opponent = opponentId ? host.getPlayer(opponentId) : undefined;

    if (!opponent) {
      return;
    }

    if (event.type === 'activateCounter') {
      const definition: StandardEffectDefinition = {
        id: 'el-thor-114-counter-dynamic-power',
        text: '[Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, if your opponent has 2 or less Life cards, that card gains an additional +2000 power during this battle.',
        trigger: { type: 'activateCounter' },
        actions: [
          {
            type: 'modifyPower',
            selector: {
              player: 'self',
              zones: ['leader', 'characters'],
              count: { kind: 'upTo', value: 1 },
            },
            amount: opponent.zones.life.length <= 2 ? 4000 : 2000,
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

    const definition: StandardEffectDefinition = {
      id: 'el-thor-114-trigger-ko-cost-equal-to-opponent-life',
      text: "[Trigger] K.O. up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life cards.",
      trigger: { type: 'trigger' },
      actions: [
        {
          type: 'ko',
          selector: {
            player: 'opponent',
            zones: ['characters'],
            filter: {
              cardCategory: ['Character'],
              costMax: opponent.zones.life.length,
            },
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
  },
};
