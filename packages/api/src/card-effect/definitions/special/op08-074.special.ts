import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op08074SpecialHandler: SpecialHandlerDefinition = {
  id: 'op08-074-special',
  cardId: 'OP08-074',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;
    const otherBlackMarias = host.getCards(
      {
        player: 'self',
        zones: ['characters'],
        filter: {
          name: ['Black Maria'],
          excludeInstanceId: event.sourceInstanceId,
        },
      },
      event.playerSessionId,
    );
    if (otherBlackMarias.length > 0) {
      engine.reapplyContinuousEffects();
      return;
    }
    const donDeck = host.getCards(
      { player: 'self', zones: ['donDeck'] },
      event.playerSessionId,
    );
    const amount = Math.min(5, donDeck.length);
    for (let i = 0; i < amount; i++) {
      host.addDonFromDeck(event.playerSessionId, true);
    }
    const myDonCount = host.getCards(
      { player: 'self', zones: ['cost'] },
      event.playerSessionId,
    ).length;
    const opponentDonCount = host.getCards(
      { player: 'opponent', zones: ['cost'] },
      event.playerSessionId,
    ).length;
    if (myDonCount > opponentDonCount) {
      anyEngine.delayedEffects.push({
        trigger: { type: 'onTurnEnd' },
        sourceInstanceId: event.sourceInstanceId,
        resolve: () => {
          const currentMyDon = host.getCards(
            { player: 'self', zones: ['cost'] },
            event.playerSessionId,
          ).length;
          const currentOpponentDon = host.getCards(
            { player: 'opponent', zones: ['cost'] },
            event.playerSessionId,
          ).length;
          if (currentMyDon > currentOpponentDon) {
            const excess = currentMyDon - currentOpponentDon;
            const myDonCards = host.getCards(
              { player: 'self', zones: ['cost'] },
              event.playerSessionId,
            );
            for (let i = 0; i < excess && i < myDonCards.length; i++) {
              host.returnDonToDonDeck(myDonCards[i], event.playerSessionId);
            }
          }
          engine.reapplyContinuousEffects();
        },
      });
    }
    engine.reapplyContinuousEffects();
  },
};
