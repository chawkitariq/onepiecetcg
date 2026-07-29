import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op06039SpecialHandler: SpecialHandlerDefinition = {
  id: 'op06-039-special',
  cardId: 'OP06-039',
  resolve(event, engine) {
    if (event.type === 'trigger') {
      const anyEngine = engine as any;
      const host = anyEngine.host;
      const source = host.getCard(event.sourceInstanceId);
      if (!source) return;
      host.handleDecision(
        event.playerSessionId,
        {
          type: 'confirm',
          message:
            "Activate [Main] effect of You Ain't Even Worth Killing Time!!?",
          optional: false,
        },
        (confirmed) => {
          if (!confirmed) return;
          this.resolve({ ...event, type: 'activateMain' }, engine);
        },
      );
      return;
    }

    if (event.type !== 'activateMain') return;
    const anyEngine = engine as any;

    anyEngine.decisions.chooseChoice(
      `${event.sourceInstanceId}:op06-039:choice`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      'Choose one:',
      [
        {
          id: 'rest',
          label:
            "Rest up to 1 of your opponent's Characters with a cost of 6 or less",
        },
        {
          id: 'ko',
          label:
            "K.O. up to 1 of your opponent's rested Characters with a cost of 6 or less",
        },
      ],
      1,
      1,
      (choiceIds) => {
        const choice = choiceIds[0];
        if (choice === 'rest') {
          anyEngine.decisions.chooseCards(
            `${event.sourceInstanceId}:op06-039:rest-target`,
            event.playerSessionId,
            { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
            event.playerSessionId,
            'Choose a Character to rest:',
            {
              player: 'opponent',
              zones: ['characters'],
              filter: { cardCategory: ['Character'], costMax: 6 },
              count: { kind: 'upTo', value: 1 },
            },
            undefined,
            (cards) => {
              for (const card of cards) anyEngine.host.restCard(card);
            },
          );
        } else {
          anyEngine.decisions.chooseCards(
            `${event.sourceInstanceId}:op06-039:ko-target`,
            event.playerSessionId,
            { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
            event.playerSessionId,
            'Choose a rested Character to K.O.:',
            {
              player: 'opponent',
              zones: ['characters'],
              filter: { cardCategory: ['Character'], rested: true, costMax: 6 },
              count: { kind: 'upTo', value: 1 },
            },
            undefined,
            (cards) => {
              for (const card of cards)
                anyEngine.host.moveCard(card, event.playerSessionId, 'trash');
            },
          );
        }
      },
    );
  },
};
