import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

export const op08119SpecialHandler: SpecialHandlerDefinition = {
  id: 'op08-119-special',
  cardId: 'OP08-119',
  resolve(event, engine) {
    if (event.type !== 'whenAttacking') return;
    const source = engine.getCard(event.sourceInstanceId);
    if (!source) return;
    const allDon = engine.getCards(
      { player: 'self', zones: ['cost'] },
      event.playerSessionId,
    );
    if (allDon.length < 10) return;
    for (let i = 0; i < 10; i++) {
      if (i < allDon.length) {
        engine.returnDonToDonDeck(
          allDon[i] as unknown as string,
          event.playerSessionId as unknown as number,
        );
      }
    }
    const opponentChars = engine.getCards(
      { player: 'opponent', zones: ['characters'] },
      event.playerSessionId,
    );
    for (const card of opponentChars) {
      if (card.instanceId !== event.sourceInstanceId) {
        engine.moveCard(card, card.ownerSessionId, 'trash');
      }
    }
    const myChars = engine.getCards(
      { player: 'self', zones: ['characters'] },
      event.playerSessionId,
    );
    for (const card of myChars) {
      if (card.instanceId !== event.sourceInstanceId) {
        engine.moveCard(card, card.ownerSessionId, 'trash');
      }
    }
    const deckTop = engine.getCards(
      { player: 'self', zones: ['deck'], count: { kind: 'exact', value: 1 } },
      event.playerSessionId,
    );
    if (deckTop.length) {
      engine.moveCard(deckTop[0], event.playerSessionId, 'life');
    }
    const opponentLifeTop = engine.getCards(
      {
        player: 'opponent',
        zones: ['life'],
        count: { kind: 'exact', value: 1 },
      },
      event.playerSessionId,
    );
    if (opponentLifeTop.length) {
      engine.moveCard(
        opponentLifeTop[0],
        engine.getOpponentSessionId(event.playerSessionId)!,
        'trash',
      );
    }
    engine.reapplyContinuousEffects();
  },
};
