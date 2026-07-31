import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP10-098
 * [On Play] Return up to 1 Character with a cost of 6 or more to its
 * owner's hand. Then, if you have 7 or more DON!! cards on your field,
 * play up to 1 {Wano} type Character card with a cost of 5 or more
 * from your hand.
 */
export const op10098SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-098-special',
  cardId: 'OP10-098',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;
    engine.chooseCards(
      `${event.sourceInstanceId}:op10-098:return-to-hand`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      'Return 1 Character (cost 6 or more) to hand:',
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], costMin: 6 },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (returnCards) => {
        for (const card of returnCards) {
          engine.moveCard(card, card.ownerSessionId, 'hand');
        }
        const selfDon = engine.getCards(
          { player: 'self', zones: ['cost'] },
          event.playerSessionId,
        );
        if (selfDon.length < 7) {
          engine.reapplyContinuousEffects();
          return;
        }
        engine.chooseCards(
          `${event.sourceInstanceId}:op10-098:play-wano`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          'Play 1 Wano Character (cost 5 or more) from your hand:',
          {
            player: 'self',
            zones: ['hand'],
            filter: {
              cardCategory: ['Character'],
              trait: ['Wano'],
              costMin: 5,
            },
            count: { kind: 'upTo', value: 1 },
          },
          undefined,
          (playCards) => {
            for (const card of playCards) {
              engine.playCard(card, event.playerSessionId, 'characters');
            }
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
