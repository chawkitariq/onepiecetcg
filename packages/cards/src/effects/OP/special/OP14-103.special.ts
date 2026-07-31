import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP14-103 Gloriosa (Grandma Nyon)
 * [On Play] You may add 1 card from the top or bottom of your Life cards to
 * your hand: Add up to 1 card from your hand to the top of your Life cards.
 * [Trigger] Play this card.
 */
export const op14103SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-103-special',
  cardId: 'OP14-103',
  resolve(event, engine) {
    if (event.type === 'onPlay') {
      const player = engine.getPlayer(event.playerSessionId);
      if (!player) return;

      if (!player.zones.life.length) return;

      engine.chooseChoices(
        `${event.sourceInstanceId}:op14-103:life-position`,
        event.playerSessionId,
        '[Gloriosa] Add 1 card from top or bottom of Life to hand?',
        [
          { id: 'top', label: 'Top of Life' },
          { id: 'bottom', label: 'Bottom of Life' },
          { id: 'cancel', label: 'No' },
        ],
        1,
        1,
        (choiceIds) => {
          if (choiceIds.includes('cancel')) return;

          const fromBottom = choiceIds.includes('bottom');
          const lifeCard = engine.getCards(
            {
              player: 'self',
              zones: ['life'],
              count: { kind: 'exact', value: 1 },
              filter: fromBottom
                ? { zonePosition: 'bottom' }
                : { zonePosition: 'top' },
            },
            event.playerSessionId,
          );
          if (!lifeCard.length) return;
          engine.moveCard(lifeCard[0], event.playerSessionId, 'hand');

          engine.chooseCards(
            `${event.sourceInstanceId}:op14-103:add-to-life`,
            event.playerSessionId,
            { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
            event.playerSessionId,
            '[Gloriosa] Add up to 1 card from your hand to the top of your Life cards:',
            {
              player: 'self',
              zones: ['hand'],
              count: { kind: 'upTo', value: 1 },
            },
            undefined,
            (selected) => {
              for (const card of selected) {
                engine.moveCard(card, event.playerSessionId, 'life');
              }
              engine.syncPlayer(event.playerSessionId);
              engine.reapplyContinuousEffects();
            },
          );
        },
      );
    } else if (event.type === 'trigger') {
      const source = engine.getCard(event.sourceInstanceId);
      if (!source) return;
      engine.playCard(source, event.playerSessionId, 'characters');
      engine.syncPlayer(event.playerSessionId);
      engine.reapplyContinuousEffects();
    }
  },
};
