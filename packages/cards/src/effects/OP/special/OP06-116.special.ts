import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

export const op06116SpecialHandler: SpecialHandlerDefinition = {
  id: 'op06-116-special',
  cardId: 'OP06-116',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;

    engine.chooseChoices(
      `${event.sourceInstanceId}:op06-116:choice`,
      event.playerSessionId,
      'Choose one:',
      [
        {
          id: 'ko',
          label:
            "K.O. up to 1 of your opponent's Characters with a cost of 5 or less",
        },
        {
          id: 'damage',
          label: 'If your opponent has 1 Life card, deal 1 damage',
        },
      ],
      1,
      1,
      (choiceIds) => {
        if (choiceIds[0] === 'ko') {
          engine.chooseCards(
            `${event.sourceInstanceId}:op06-116:ko-target`,
            event.playerSessionId,
            { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
            event.playerSessionId,
            'Choose a Character to K.O. (cost 5 or less):',
            {
              player: 'opponent',
              zones: ['characters'],
              filter: { cardCategory: ['Character'], costMax: 5 },
              count: { kind: 'upTo', value: 1 },
            },
            undefined,
            (cards) => {
              for (const card of cards)
                engine.moveCard(card, event.playerSessionId, 'trash');
            },
          );
        } else {
          const oppLife = engine.getCards(
            { player: 'opponent', zones: ['life'] },
            event.playerSessionId,
          );
          if (oppLife.length === 1) {
            const opponentId = engine.getOpponentSessionId(
              event.playerSessionId,
            );
            if (opponentId && oppLife[0]) {
              engine.moveCard(oppLife[0], opponentId, 'hand');
              engine.syncPlayer(opponentId);
            }
          }
        }

        const lifeCard = engine.getCards(
          { player: 'self', zones: ['life'] },
          event.playerSessionId,
        )[0];
        if (lifeCard) {
          engine.moveCard(lifeCard, event.playerSessionId, 'hand');
        }
      },
    );
  },
};
