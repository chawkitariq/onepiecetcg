import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op04116SpecialHandler: SpecialHandlerDefinition = {
  id: 'op04-116-special',
  cardId: 'OP04-116',
  resolve(event, engine) {
    if (event.type === 'trigger') {
      const triggerDefinition: StandardEffectDefinition = {
        id: 'diable-jambe-joue-shot-trigger-draw-1',
        text: '[Trigger] Draw 1 card.',
        trigger: { type: 'trigger' },
        actions: [{ type: 'draw', player: 'self', amount: 1 }],
      };

      engine.queueEffect(
        event.playerSessionId,
        event.sourceInstanceId,
        event.sourceCardId,
        triggerDefinition,
      );
      return;
    }

    if (event.type !== 'activateCounter') {
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

    const totalLife = player.zones.life.length + opponent.zones.life.length;
    const actions: StandardEffectDefinition['actions'] = [
      {
        type: 'modifyPower',
        selector: {
          player: 'self',
          zones: ['leader', 'characters'],
          count: { kind: 'upTo', value: 1 },
        },
        amount: 6000,
        duration: { type: 'untilEndOfBattle' },
      },
    ];

    if (totalLife <= 4) {
      actions.push({
        type: 'ko',
        selector: {
          player: 'opponent',
          zones: ['characters'],
          filter: { cardCategory: ['Character'], costMax: 2 },
          count: { kind: 'upTo', value: 1 },
        },
        reason: 'effect',
      });
    }

    const definition: StandardEffectDefinition = {
      id: 'diable-jambe-joue-shot-counter-special',
      text: "[Counter] Up to 1 of your Leader or Character cards gains +6000 power during this battle. Then, if you and your opponent have a total of 4 or less Life cards, K.O. up to 1 of your opponent's Characters with a cost of 2 or less.",
      trigger: { type: 'activateCounter' },
      actions,
    };

    engine.queueEffect(
      event.playerSessionId,
      event.sourceInstanceId,
      event.sourceCardId,
      definition,
    );
  },
};
