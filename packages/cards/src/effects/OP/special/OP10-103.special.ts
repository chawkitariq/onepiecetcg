import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP10-103
 * [On Play] Choose 1 card from the top or bottom of your Life cards and
 * add it to your hand. Then, add up to 1 {Supernovas} type Character
 * card from your hand to the top of your Life cards face-up.
 */
export const op10103SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-103-special',
  cardId: 'OP10-103',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;
    if (player.zones.life.length === 0) {
      engine.reapplyContinuousEffects();
      return;
    }
    engine.chooseChoices(
      `${event.sourceInstanceId}:op10-103:life-top-or-bottom`,
      event.playerSessionId,
      'Add top or bottom Life card to hand?',
      [
        { id: 'top', label: 'Top of Life' },
        { id: 'bottom', label: 'Bottom of Life' },
      ],
      1,
      1,
      (choiceIds) => {
        const fromBottom = choiceIds.includes('bottom');
        const lifeCards = engine.getCards(
          { player: 'self', zones: ['life'] },
          event.playerSessionId,
        );
        const targetLife = fromBottom
          ? lifeCards[lifeCards.length - 1]
          : lifeCards[0];
        if (!targetLife) {
          engine.reapplyContinuousEffects();
          return;
        }
        engine.moveCard(targetLife, event.playerSessionId, 'hand');
        engine.chooseCards(
          `${event.sourceInstanceId}:op10-103:add-supernovas`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          'Add 1 Supernovas Character from hand to top of Life face-up:',
          {
            player: 'self',
            zones: ['hand'],
            filter: { cardCategory: ['Character'], families: ['Supernovas'] },
            count: { kind: 'upTo', value: 1 },
          },
          undefined,
          (cards) => {
            for (const card of cards) {
              engine.moveCard(card, event.playerSessionId, 'life');
            }
            engine.syncPlayer(event.playerSessionId);
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
