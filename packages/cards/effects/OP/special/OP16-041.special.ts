import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import {
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
} from '../../special-handler-utils.js';

/**
 * OP16-041
 * [DON!! X1] [Once Per Turn] When your {Impel Down} type Character card
 * is removed from the field, play up to 1 [Prisoner of Impel Down] from hand.
 *
 * This handler fires when OP16-041 itself (an Impel Down Character) is removed
 * from the field. DON!! X1 is checked on OP16-041's attached DON count.
 */
export const op16041SpecialHandler: SpecialHandlerDefinition = {
  id: 'op16-041-impel-down-removed-play-prisoner',
  cardId: 'OP16-041',
  resolve(event, engine) {
    if ((event as any).type !== 'onCardRemovedByEffect') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    if (source.attachedDon < 1) return;

    if (
      hasResolvedOncePerTurn(
        anyEngine,
        event.sourceInstanceId,
        'op16-041',
        host.state.turn,
      )
    ) {
      return;
    }
    markResolvedOncePerTurn(
      anyEngine,
      event.sourceInstanceId,
      'op16-041',
      host.state.turn,
    );

    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op16-041:play-prisoner`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      'Play up to 1 [Prisoner of Impel Down] from your hand:',
      {
        player: 'self',
        zones: ['hand'],
        filter: {
          cardCategory: ['Character'],
          name: ['Prisoner of Impel Down'],
        },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (selected) => {
        for (const card of selected) {
          host.moveCard(card, event.playerSessionId, 'characters');
        }
        engine.reapplyContinuousEffects();
      },
    );
  },
};
