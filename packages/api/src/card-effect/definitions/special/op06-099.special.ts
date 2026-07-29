import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op06099SpecialHandler: SpecialHandlerDefinition = {
  id: 'op06-099-special',
  cardId: 'OP06-099',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;

    anyEngine.decisions.chooseChoice(
      `${event.sourceInstanceId}:op06-099:which-life`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      'Which Life cards to look at?',
      [
        { id: 'self', label: 'Look at your own Life cards' },
        { id: 'opponent', label: "Look at your opponent's Life cards" },
      ],
      1,
      1,
      (choiceIds) => {
        const targetPlayer = choiceIds[0] === 'self' ? 'self' : 'opponent';

        anyEngine.decisions.chooseCards(
          `${event.sourceInstanceId}:op06-099:choose-life-card`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          'Choose up to 1 Life card to look at:',
          {
            player: targetPlayer,
            zones: ['life'],
            filter: { zonePosition: 'top' },
            count: { kind: 'upTo', value: 1 },
          },
          undefined,
          (cards) => {
            for (const card of cards) {
              anyEngine.decisions.chooseChoice(
                `${event.sourceInstanceId}:op06-099:position`,
                event.playerSessionId,
                {
                  sourceInstanceId: event.sourceInstanceId,
                  storedSelections: {},
                },
                event.playerSessionId,
                'Place the card at the top or bottom?',
                [
                  { id: 'top', label: 'Top' },
                  { id: 'bottom', label: 'Bottom' },
                ],
                1,
                1,
                (posChoice) => {
                  host.moveCard(
                    card,
                    targetPlayer === 'self' ? event.playerSessionId : undefined,
                    'life',
                    {
                      toBottom: posChoice[0] === 'bottom',
                      faceDown: false,
                    },
                  );
                },
              );
            }
          },
        );
      },
    );
  },
};
