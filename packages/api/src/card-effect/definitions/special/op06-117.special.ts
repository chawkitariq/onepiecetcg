import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op06117SpecialHandler: SpecialHandlerDefinition = {
  id: 'op06-117-special',
  cardId: 'OP06-117',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;

    const enelCards = host.getCards(
      { player: 'self', zones: ['characters'], filter: { name: ['Enel'] } },
      event.playerSessionId,
    );

    if (enelCards.length === 0) return;

    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op06-117:rest-enel`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[The Ark Maxim] Choose 1 of your [Enel] cards to rest:',
      {
        player: 'self',
        zones: ['characters'],
        filter: { name: ['Enel'], rested: false },
        count: { kind: 'exact', value: 1 },
      },
      undefined,
      (enelSelected) => {
        for (const card of enelSelected) host.restCard(card);

        const source = host.getCard(event.sourceInstanceId);
        if (source) host.restCard(source);

        const opponentChars = host.getCards(
          {
            player: 'opponent',
            zones: ['characters'],
            filter: { cardCategory: ['Character'], costMax: 2 },
          },
          event.playerSessionId,
        );
        for (const card of opponentChars) {
          host.moveCard(card, event.playerSessionId, 'trash');
        }
        engine.reapplyContinuousEffects();
      },
    );
  },
};
