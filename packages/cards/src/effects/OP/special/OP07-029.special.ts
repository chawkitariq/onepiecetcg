/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

export const op07029SpecialHandler: SpecialHandlerDefinition = {
  id: 'op07-029-special',
  cardId: 'OP07-029',
  resolve(event, engine) {
    const anyEvt = event as any;
    if (anyEvt.type !== 'wouldMoveCard') return;
    const source = engine.getCard(anyEvt.sourceInstanceId);
    if (!source) return;
    const oncePerTurnKey = `${anyEvt.sourceInstanceId}:op07-029:${engine.state.turn}`;
    if (engine.hasResolvedOncePerTurnKey(oncePerTurnKey)) return;
    const player = engine.getPlayer(anyEvt.playerSessionId);
    if (!player) return;
    const leaderHasSupernovas =
      player.zones.leader.families?.includes('Supernovas');
    if (!leaderHasSupernovas) return;
    engine.markResolvedOncePerTurnKey(oncePerTurnKey);
    engine.chooseCards(
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
          engine.patchCardStatus(card.instanceId, { rested: true });
        }
        engine.preventDefaultMove();
        engine.reapplyContinuousEffects();
      },
    );
  },
};
