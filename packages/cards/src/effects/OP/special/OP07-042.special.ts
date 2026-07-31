/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

export const op07042SpecialHandler: SpecialHandlerDefinition = {
  id: 'op07-042-special',
  cardId: 'OP07-042',
  resolve(event, engine) {
    const anyEvt = event as any;
    if (anyEvt.type !== 'wouldMoveCard') return;
    const source = engine.getCard(anyEvt.sourceInstanceId);
    if (!source) return;
    const oncePerTurnKey = `${anyEvt.sourceInstanceId}:op07-042:${engine.state.turn}`;
    if (engine.hasResolvedOncePerTurnKey(oncePerTurnKey)) return;
    const player = engine.getPlayer(anyEvt.playerSessionId);
    if (!player) return;
    const leaderHasWarlords = player.zones.leader.families?.includes(
      'The Seven Warlords of the Sea',
    );
    if (!leaderHasWarlords) return;
    engine.markResolvedOncePerTurnKey(oncePerTurnKey);
    engine.chooseCards(
      `${anyEvt.sourceInstanceId}:op07-042:place-instead`,
      anyEvt.playerSessionId,
      { sourceInstanceId: anyEvt.sourceInstanceId, storedSelections: {} },
      anyEvt.playerSessionId,
      '[Gecko Moria] Choose 1 of your Characters (other than Gecko Moria) to place at bottom of deck instead:',
      {
        player: 'self',
        zones: ['characters'],
        filter: {
          cardCategory: ['Character'],
          excludeName: ['Gecko Moria 042'],
        },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (cards) => {
        for (const card of cards) {
          engine.moveCard(card, anyEvt.playerSessionId, 'deck', {
            toBottom: true,
          });
        }
        if (cards.length > 0) engine.preventDefaultMove();
        engine.reapplyContinuousEffects();
      },
    );
  },
};
