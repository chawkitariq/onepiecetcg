/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

export const op07029SpecialHandler: SpecialHandlerDefinition = {
  id: 'op07-029-special',
  cardId: 'OP07-029',
  resolve(event, engine) {
    const anyEvt = event as any;
    if (anyEvt.type !== 'wouldMoveCard') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(anyEvt.sourceInstanceId);
    if (!source) return;
    const oncePerTurnKey = `${anyEvt.sourceInstanceId}:op07-029:${host.state.turn}`;
    if (anyEngine.resolvedOncePerTurnKeys?.has(oncePerTurnKey)) return;
    const player = host.getPlayer(anyEvt.playerSessionId);
    if (!player) return;
    const leaderHasSupernovas = player.leader?.families?.includes('Supernovas');
    if (!leaderHasSupernovas) return;
    anyEngine.resolvedOncePerTurnKeys?.add(oncePerTurnKey);
    anyEngine.decisions.chooseCards(
      `${anyEvt.sourceInstanceId}:op07-029:rest-instead`,
      anyEvt.playerSessionId,
      { sourceInstanceId: anyEvt.sourceInstanceId, storedSelections: {} },
      anyEvt.playerSessionId,
      "[Basil Hawkins] Choose 1 of your opponent's Characters to rest instead:",
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'] },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (cards) => {
        for (const card of cards) {
          host.restCard(card);
        }
        anyEngine.preventDefaultMove();
        anyEngine.reapplyContinuousEffects();
      },
    );
  },
};
