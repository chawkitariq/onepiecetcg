import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP12-017
 * [Main] Up to 1 opponent Character cannot attack during this turn.
 * [Trigger] Up to 1 opponent Character cannot attack during this turn.
 */
export const op12017SpecialHandler: SpecialHandlerDefinition = {
  id: 'op12-017-special',
  cardId: 'OP12-017',
  resolve(event, engine) {
    const canAttackBlockAction: StandardEffectDefinition['actions'][0] = {
      type: 'grantKeywords',
      selector: {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'] },
        count: { kind: 'upTo', value: 1 },
      },
      keywords: ['cannotAttack'],
      duration: { type: 'untilEndOfTurn' },
    };

    if (event.type === 'activateMain') {
      const definition: StandardEffectDefinition = {
        id: 'op12-017-main',
        text: '[Main] Up to 1 opponent Character cannot attack during this turn.',
        trigger: { type: 'activateMain' },
        actions: [canAttackBlockAction],
      };

      engine.queueEffect(
        event.playerSessionId,
        event.sourceInstanceId,
        event.sourceCardId,
        definition,
      );
      return;
    }

    if (event.type !== 'trigger') return;

    const definition: StandardEffectDefinition = {
      id: 'op12-017-trigger',
      text: '[Trigger] Up to 1 opponent Character cannot attack during this turn.',
      trigger: { type: 'trigger' },
      actions: [canAttackBlockAction],
    };

    engine.queueEffect(
      event.playerSessionId,
      event.sourceInstanceId,
      event.sourceCardId,
      definition,
    );
  },
};
