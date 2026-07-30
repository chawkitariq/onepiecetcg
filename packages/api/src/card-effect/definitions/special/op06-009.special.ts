import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op06009SpecialHandler: SpecialHandlerDefinition = {
  id: 'op06-009-special',
  cardId: 'OP06-009',
  resolve(event, engine) {
    if (event.type !== 'whenAttacking' && event.type !== 'onBlock') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    const source = host.getCard(event.sourceInstanceId);
    if (!player || !source) return;

    const oncePerTurnKey = `${event.sourceInstanceId}:op06-009:${host.state.turn}`;
    if (anyEngine.resolvedOncePerTurnKeys?.has(oncePerTurnKey)) return;
    anyEngine.resolvedOncePerTurnKeys?.add(oncePerTurnKey);

    const opponentLeader = host.getCards(
      { player: 'opponent', zones: ['leader'] },
      event.playerSessionId,
    )[0];
    if (!opponentLeader) return;

    const basePower = opponentLeader.basePower ?? opponentLeader.power ?? 0;
    source.basePower = basePower;
    host.syncCard(source);
  },
};
