import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

export const op08119SpecialHandler: SpecialHandlerDefinition = {
  id: 'op08-119-special',
  cardId: 'OP08-119',
  resolve(event, engine) {
    if (event.type !== 'whenAttacking') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;
    const allDon = host.getCards(
      { player: 'self', zones: ['cost'] },
      event.playerSessionId,
    );
    if (allDon.length < 10) return;
    for (let i = 0; i < 10; i++) {
      if (i < allDon.length) {
        host.returnDonToDonDeck(allDon[i], event.playerSessionId);
      }
    }
    const opponentChars = host.getCards(
      { player: 'opponent', zones: ['characters'] },
      event.playerSessionId,
    );
    for (const card of opponentChars) {
      if (card.instanceId !== event.sourceInstanceId) {
        host.moveCard(card, card.ownerSessionId, 'trash');
      }
    }
    const myChars = host.getCards(
      { player: 'self', zones: ['characters'] },
      event.playerSessionId,
    );
    for (const card of myChars) {
      if (card.instanceId !== event.sourceInstanceId) {
        host.moveCard(card, card.ownerSessionId, 'trash');
      }
    }
    const deckTop = host.getCards(
      { player: 'self', zones: ['deck'], count: { kind: 'exact', value: 1 } },
      event.playerSessionId,
    );
    if (deckTop.length) {
      host.moveCard(deckTop[0], event.playerSessionId, 'life');
    }
    const opponentLifeTop = host.getCards(
      {
        player: 'opponent',
        zones: ['life'],
        count: { kind: 'exact', value: 1 },
      },
      event.playerSessionId,
    );
    if (opponentLifeTop.length) {
      host.moveCard(
        opponentLifeTop[0],
        host.getOpponentSessionId(event.playerSessionId),
        'trash',
      );
    }
    engine.reapplyContinuousEffects();
  },
};
