import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP10-034
 * [On Play] Set up to 2 DON!! cards from your DON!! deck as active.
 * Then, your opponent adds 1 card from the top of their deck to their
 * Life cards. Then, if the total number of DON!! cards on the field
 * is 8 or more, draw 1 card.
 */
export const op10034SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-034-special',
  cardId: 'OP10-034',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;
    const opponentSessionId = engine.getOpponentSessionId(event.playerSessionId);
    if (!opponentSessionId) return;
    engine.chooseChoices(
      `${event.sourceInstanceId}:op10-034:don-amount`,
      event.playerSessionId,
      'Set how many DON!! active? (up to 2)',
      [
        { id: '0', label: '0' },
        { id: '1', label: '1' },
        { id: '2', label: '2' },
      ],
      1,
      1,
      (choiceIds) => {
        const amount = parseInt(choiceIds[0], 10);
        if (amount > 0) {
          engine.addDonToCost(event.playerSessionId, amount, false);
        }
        const opponentDeckTop = engine.getCards(
          {
            player: 'self',
            zones: ['deck'],
            count: { kind: 'exact', value: 1 },
          },
          opponentSessionId,
        );
        if (opponentDeckTop.length > 0) {
          engine.moveCard(opponentDeckTop[0], opponentSessionId, 'life');
        }
        const selfDon = engine.getCards(
          { player: 'self', zones: ['cost'] },
          event.playerSessionId,
        );
        const oppDon = engine.getCards(
          { player: 'opponent', zones: ['cost'] },
          event.playerSessionId,
        );
        const totalDonOnField = selfDon.length + oppDon.length;
        if (totalDonOnField >= 8) {
          engine.drawCard(event.playerSessionId);
        }
        engine.syncPlayer(event.playerSessionId);
        engine.syncPlayer(opponentSessionId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
