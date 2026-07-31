import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils.js';

/**
 * OP16-115
 * [Trigger] Negate the effect of up to 1 of your opponent's
 * Leader or Character cards during this turn.
 */
export const op16115SpecialHandler: SpecialHandlerDefinition = {
  id: 'op16-115-negate-effect-trigger',
  cardId: 'OP16-115',
  resolve(event, engine) {
    if (event.type !== 'trigger') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;

    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op16-115:negate`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      'Negate the effect of up to 1 opponent Leader or Character:',
      {
        player: 'opponent',
        zones: ['leader', 'characters'],
        filter: { cardCategory: ['Leader', 'Character'] },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (selected) => {
        for (const card of selected) {
          patchSpecialHandlerCardStatus(host, card, {
            effectNegated: true,
          });
        }
        engine.reapplyContinuousEffects();
      },
    );
  },
};
