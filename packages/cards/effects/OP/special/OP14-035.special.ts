/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils.js';

/**
 * OP14-035 Yosaku
 * [Your Turn] When this Character becomes rested, up to 1 of your opponent's
 * rested Characters with a cost of 4 or less will not become active in your
 * opponent's next Refresh Phase.
 */
export const op14035SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-035-special',
  cardId: 'OP14-035',
  resolve(event, engine) {
    if (event.type !== 'onDonAttached' && event.type !== 'onPlay') return;
    const source = engine.getCard(event.sourceInstanceId);
    if (!source || !source.rested) return;
    const activePlayerSessionId = engine.state.activePlayerSessionId;
    if (activePlayerSessionId !== event.playerSessionId) return;

    engine.chooseCards(
      `${event.sourceInstanceId}:op14-035:skip-refresh`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Yosaku] Select up to 1 opponent rested Character (cost 4 or less) to skip next Refresh Phase:',
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], costMax: 4, rested: true },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (selected) => {
        for (const card of selected) {
          patchSpecialHandlerCardStatus(engine, card, {
            skipNextRefreshPhases: (card.skipNextRefreshPhases || 0) + 1,
          });
        }
        engine.syncPlayer(event.playerSessionId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
