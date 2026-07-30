import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op06116SpecialHandler: SpecialHandlerDefinition = {
  id: 'op06-116-special',
  cardId: 'OP06-116',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    anyEngine.decisions.chooseChoice(
      `${event.sourceInstanceId}:op06-116:choice`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
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
          anyEngine.decisions.chooseCards(
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
                host.moveCard(card, event.playerSessionId, 'trash');
            },
          );
        } else {
          const oppLife = host.getCards(
            { player: 'opponent', zones: ['life'] },
            event.playerSessionId,
          ).length;
          if (oppLife === 1) {
            anyEngine.host.dealDamage(event.playerSessionId, 'opponent', 1);
          }
        }

        const lifeCard = host.getCards(
          { player: 'self', zones: ['life'] },
          event.playerSessionId,
        )[0];
        if (lifeCard) {
          host.moveCard(lifeCard, event.playerSessionId, 'hand');
        }
      },
    );
  },
};
