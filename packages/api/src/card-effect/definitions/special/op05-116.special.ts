import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * Handles Hino Bird Zap because its KO threshold depends on the opponent's
 * current Life count, which must be read dynamically when the effect resolves.
 */
export const op05116SpecialHandler: SpecialHandlerDefinition = {
  id: 'op05-116-special',
  cardId: 'OP05-116',
  resolve(event, engine) {
    if (event.type !== 'onPlay' && event.type !== 'trigger') {
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

    const definition: StandardEffectDefinition = {
      id:
        event.type === 'trigger'
          ? 'hino-bird-zap-116-trigger-activate-main'
          : 'hino-bird-zap-116-main-ko-cost-equal-to-opponent-life',
      text:
        event.type === 'trigger'
          ? "[Trigger] Activate this card's [Main] effect."
          : "[Main] K.O. up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life cards.",
      trigger: { type: event.type },
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
