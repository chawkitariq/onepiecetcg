/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP10-092
 * [On Play] Rest up to 2 of your opponent's Characters with a cost less
 * than or equal to the number of DON!! cards on your field.
 */
export const op10092SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-092-special',
  cardId: 'OP10-092',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;
    const selfDon = host.getCards(
      { player: 'self', zones: ['cost'] },
      event.playerSessionId,
    );
    const oppDon = host.getCards(
      { player: 'opponent', zones: ['cost'] },
      event.playerSessionId,
    );
    const totalDonOnField = selfDon.length + oppDon.length;
    decisions.chooseCards(
      `${event.sourceInstanceId}:op10-092:rest-chars`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      `Rest up to 2 Characters with cost <= ${totalDonOnField}:`,
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], costMax: totalDonOnField },
        count: { kind: 'upTo', value: 2 },
      },
      undefined,
      (cards) => {
        for (const card of cards) {
          host.restCard(card);
        }
        engine.reapplyContinuousEffects();
      },
    );
  },
};
