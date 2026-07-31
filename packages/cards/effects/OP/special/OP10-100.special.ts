import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP10-100
 * [On Play] K.O. up to 1 Character with a cost less than or equal to
 * the total number of DON!! cards on the field minus 1.
 */
export const op10100SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-100-special',
  cardId: 'OP10-100',
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
    const totalDon = selfDon.length + oppDon.length;
    const maxCost = Math.max(0, totalDon - 1);
    engine.chooseCards(
      `${event.sourceInstanceId}:op10-100:ko-char`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      `K.O. up to 1 Character with cost <= ${maxCost}:`,
      {
        player: 'either',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], costMax: maxCost },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (cards) => {
        for (const card of cards) {
          engine.koCharacter(card.ownerSessionId, card.instanceId, 'effect');
        }
        engine.reapplyContinuousEffects();
      },
    );
  },
};
