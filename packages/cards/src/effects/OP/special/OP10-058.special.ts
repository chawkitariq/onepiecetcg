import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP10-058
 * [On Play] If there is a Character with a cost of 8 or more, draw 1 card.
 * Then, reveal up to 2 {Dressrosa} type Character cards with a cost of 7 or
 * less other than [Rebecca] from your hand. Play 1 of the revealed cards and
 * play the other card rested if it has a cost of 4 or less.
 */
export const op10058SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-058-special',
  cardId: 'OP10-058',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;
    const source = engine.getCard(event.sourceInstanceId);

    if (!source) return;

    const hasCost8OrMoreCharacter =
      engine.getCards(
        {
          player: 'either',
          zones: ['characters'],
          filter: {
            cardCategory: ['Character'],
            costMin: 8,
          },
          count: { kind: 'upTo', value: 1 },
        },
        event.playerSessionId,
      ).length > 0;

    if (hasCost8OrMoreCharacter) {
      engine.drawCard(event.playerSessionId);
      engine.syncPlayer(event.playerSessionId);
    }

    engine.chooseCards(
      `${event.sourceInstanceId}:op10-058:reveal`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Rebecca] Reveal up to 2 Dressrosa Character cards (cost 7 or less) from your hand:',
      {
        player: 'self',
        zones: ['hand'],
        filter: {
          cardCategory: ['Character'],
          trait: ['Dressrosa'],
          costMax: 7,
          excludeName: ['Rebecca'],
        },
        count: { kind: 'upTo', value: 2 },
      },
      undefined,
      (selected: any[]) => {
        if (selected.length === 0) {
          engine.reapplyContinuousEffects();
          return;
        }

        engine.addLog(
          `${source.name} revele ${selected.map((card) => card.name).join(', ')}.`,
        );

        if (selected.length === 1) {
          engine.moveCard(selected[0], selected[0].ownerSessionId, 'characters', {
            rested: false,
          });
          engine.syncPlayer(event.playerSessionId);
          engine.reapplyContinuousEffects();
          return;
        }

        engine.chooseChoices(
          `${event.sourceInstanceId}:op10-058:play-first`,
          event.playerSessionId,
          '[Rebecca] Choose 1 revealed card to play first:',
          selected.map((card) => ({
            id: card.instanceId,
            label: card.name,
            cardInstanceId: card.instanceId,
          })),
          1,
          1,
          (selectedChoiceIds: string[]) => {
            const first =
              selected.find(
                (card) => card.instanceId === selectedChoiceIds[0],
              ) ?? selected[0];
            const second = selected.find(
              (card) => card.instanceId !== first.instanceId,
            );

            engine.moveCard(first, first.ownerSessionId, 'characters', {
              rested: false,
            });

            if (second && second.cost <= 4) {
              engine.moveCard(second, second.ownerSessionId, 'characters', {
                rested: true,
              });
            }

            engine.syncPlayer(event.playerSessionId);
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
