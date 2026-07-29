import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP15-046 "Sabo"
 * [Blocker]
 * [On Play] If your Leader has the {Dressrosa} type, activate up to 1
 * {Dressrosa} type Event from your hand.
 */
export const op15046SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-046-special',
  cardId: 'OP15-046',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    const leaderHasDressrosa = (player.zones.leader.families ?? []).includes(
      'Dressrosa',
    );
    if (!leaderHasDressrosa) return;

    const definition: StandardEffectDefinition = {
      id: 'sabo-046-on-play-activate-dressrosa-event',
      text: '[On Play] If your Leader has the {Dressrosa} type, activate up to 1 {Dressrosa} type Event from your hand.',
      trigger: { type: 'onPlay', optional: true },
      actions: [],
    };

    engine.queueEffect(
      event.playerSessionId,
      event.sourceInstanceId,
      event.sourceCardId,
      definition,
    );
  },
};
