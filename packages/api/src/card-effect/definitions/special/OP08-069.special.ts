import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op08069SpecialHandler: SpecialHandlerDefinition = {
  id: 'op08-069-special',
  cardId: 'OP08-069',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;
    const don = host.getCards(
      { player: 'self', zones: ['cost'], filter: { rested: false } },
      event.playerSessionId,
    );
    if (don.length < 1) return;
    host.restCard(don[0]);
    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op08-069:trash-hand-cost`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Charlotte Linlin] You may trash 1 card from your hand:',
      { player: 'self', zones: ['hand'], count: { kind: 'exact', value: 1 } },
      undefined,
      (trashed) => {
        for (const card of trashed) {
          host.moveCard(card, event.playerSessionId, 'trash');
        }
        const deckTop = host.getCards(
          {
            player: 'self',
            zones: ['deck'],
            count: { kind: 'exact', value: 1 },
          },
          event.playerSessionId,
        );
        if (deckTop.length) {
          host.moveCard(deckTop[0], event.playerSessionId, 'life');
        }
        anyEngine.decisions.chooseCards(
          `${event.sourceInstanceId}:op08-069:move-opponent-char`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          "[Charlotte Linlin] Choose up to 1 opponent Character (cost 6 or less) to add to opponent's Life:",
          {
            player: 'opponent',
            zones: ['characters'],
            filter: { cardCategory: ['Character'], costMax: 6 },
            count: { kind: 'upTo', value: 1 },
          },
          undefined,
          (selected) => {
            for (const card of selected) {
              host.moveCard(card, card.ownerSessionId, 'life', {
                faceUp: true,
              });
            }
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
