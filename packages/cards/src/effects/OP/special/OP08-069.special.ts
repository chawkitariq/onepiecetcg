import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

export const op08069SpecialHandler: SpecialHandlerDefinition = {
  id: 'op08-069-special',
  cardId: 'OP08-069',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;
    const source = engine.getCard(event.sourceInstanceId);
    if (!source) return;
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;
    const don = engine.getCards(
      { player: 'self', zones: ['cost'], filter: { rested: false } },
      event.playerSessionId,
    );
    if (don.length < 1) return;
    engine.patchCardStatus(don[0].instanceId, { rested: true });
    engine.chooseCards(
      `${event.sourceInstanceId}:op08-069:trash-hand-cost`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Charlotte Linlin] You may trash 1 card from your hand:',
      { player: 'self', zones: ['hand'], count: { kind: 'exact', value: 1 } },
      undefined,
      (trashed) => {
        for (const card of trashed) {
          engine.moveCard(card, event.playerSessionId, 'trash');
        }
        const deckTop = engine.getCards(
          {
            player: 'self',
            zones: ['deck'],
            count: { kind: 'exact', value: 1 },
          },
          event.playerSessionId,
        );
        if (deckTop.length) {
          engine.moveCard(deckTop[0], event.playerSessionId, 'life');
        }
        engine.chooseCards(
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
              engine.moveCard(card, card.ownerSessionId, 'life', {
                faceDown: false,
              });
            }
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
