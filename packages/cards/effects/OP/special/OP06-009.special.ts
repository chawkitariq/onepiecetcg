import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

export const op06009SpecialHandler: SpecialHandlerDefinition = {
  id: 'op06-009-special',
  cardId: 'OP06-009',
  resolve(event, engine) {
    if (event.type !== 'whenAttacking' && event.type !== 'onBlock') return;
    const player = engine.getPlayer(event.playerSessionId);
    const source = engine.getCard(event.sourceInstanceId);
    if (!player || !source) return;

    const oncePerTurnKey = `${event.sourceInstanceId}:op06-009:${engine.state.turn}`;
    if (engine.hasResolvedOncePerTurnKey(oncePerTurnKey)) return;
    engine.markResolvedOncePerTurnKey(oncePerTurnKey);

    const opponentLeader = engine.getCards(
      { player: 'opponent', zones: ['leader'] },
      event.playerSessionId,
    )[0];
    if (!opponentLeader) return;

    const basePower = opponentLeader.basePower ?? opponentLeader.power ?? 0;
    if (engine.patchCardStats) {
      engine.patchCardStats(source.instanceId, { basePower });
    } else {
      source.basePower = basePower;
    }
    engine.syncPlayer(source.ownerSessionId);
  },
};
