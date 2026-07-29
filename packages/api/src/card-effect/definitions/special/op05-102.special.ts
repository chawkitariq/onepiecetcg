import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op05102SpecialHandler: SpecialHandlerDefinition = {
  id: 'op05-102-special',
  cardId: 'OP05-102',
  resolve(event, engine) {
    if (event.type !== 'onPlay') {
      return;
    }

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const opponentId = host.getOpponentSessionId(event.playerSessionId);
    const opponent = opponentId ? host.getPlayer(opponentId) : undefined;

    if (!opponent) {
      return;
    }

    const definition: StandardEffectDefinition = {
      id: 'gedatsu-102-on-play-ko-cost-equal-to-opponent-life',
      text: "[On Play] K.O. up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life cards.",
      trigger: { type: 'onPlay' },
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
