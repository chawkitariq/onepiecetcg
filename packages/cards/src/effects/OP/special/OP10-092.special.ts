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
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;
    const selfDon = engine.getCards(
      { player: 'self', zones: ['cost'] },
      event.playerSessionId,
    );
    const oppDon = engine.getCards(
      { player: 'opponent', zones: ['cost'] },
      event.playerSessionId,
    );
    const totalDonOnField = selfDon.length + oppDon.length;
    engine.chooseCards(
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
          engine.patchCardStatus(card.instanceId, { rested: true });
        }
        engine.reapplyContinuousEffects();
      },
    );
  },
};
