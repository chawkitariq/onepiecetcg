import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op08046SpecialHandler: SpecialHandlerDefinition = {
  id: 'op08-046-special',
  cardId: 'OP08-046',
  resolve(event, engine) {
    if ((event as any).type !== 'onCardRemovedByEffect') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;
    const oncePerTurnKey = `${event.sourceInstanceId}:op08-046:${host.state.turn}`;
    if (anyEngine.resolvedOncePerTurnKeys?.has(oncePerTurnKey)) return;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;
    const isYourTurn = host.state.turnPlayer === event.playerSessionId;
    if (!isYourTurn) return;
    const opponentHand = host.getCards(
      { player: 'opponent', zones: ['hand'] },
      event.playerSessionId,
    );
    if (opponentHand.length < 5) return;
    anyEngine.resolvedOncePerTurnKeys?.add(oncePerTurnKey);
    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op08-046:bottom-card`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      host.getOpponentSessionId(event.playerSessionId),
      '[Shakuyaku] Place 1 card from your hand at the bottom of your deck:',
      {
        player: 'opponent',
        zones: ['hand'],
        count: { kind: 'exact', value: 1 },
      },
      undefined,
      (cards) => {
        for (const card of cards) {
          host.moveCard(card, card.ownerSessionId, 'deck', { toBottom: true });
        }
        host.restCard(source);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
