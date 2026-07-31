import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP15-031 "Purinpurin"
 * [On Play] Select up to 1 of your opponent's rested Characters.
 * If the chosen Character has a cost equal to the number of DON!! cards given
 * to it, K.O. it.
 */
export const op15031SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-031-special',
  cardId: 'OP15-031',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    engine.chooseCards(
      `${event.sourceInstanceId}:op15-031:target`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Purinpurin] Select up to 1 opponent rested Character (KO if cost == DON!! given):',
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], rested: true },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (cards) => {
        for (const card of cards) {
          if (card.cost === card.attachedDon) {
            engine.koCharacter(card.ownerSessionId, card.instanceId, 'effect');
          }
        }
        const opponentId = engine.getOpponentSessionId(event.playerSessionId);
        engine.syncPlayer(event.playerSessionId);
        if (opponentId) engine.syncPlayer(opponentId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
