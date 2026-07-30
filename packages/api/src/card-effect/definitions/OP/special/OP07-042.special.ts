/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

export const op07042SpecialHandler: SpecialHandlerDefinition = {
  id: 'op07-042-special',
  cardId: 'OP07-042',
  resolve(event, engine) {
    const anyEvt = event as any;
    if (anyEvt.type !== 'wouldMoveCard') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(anyEvt.sourceInstanceId);
    if (!source) return;
    const oncePerTurnKey = `${anyEvt.sourceInstanceId}:op07-042:${host.state.turn}`;
    if (anyEngine.resolvedOncePerTurnKeys?.has(oncePerTurnKey)) return;
    const player = host.getPlayer(anyEvt.playerSessionId);
    if (!player) return;
    const leaderHasWarlords = player.leader?.families?.includes(
      'The Seven Warlords of the Sea',
    );
    if (!leaderHasWarlords) return;
    anyEngine.resolvedOncePerTurnKeys?.add(oncePerTurnKey);
    anyEngine.decisions.chooseCards(
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
          host.moveCard(card, anyEvt.playerSessionId, 'deck', {
            toBottom: true,
          });
        }
        if (cards.length > 0) anyEngine.preventDefaultMove();
        anyEngine.reapplyContinuousEffects();
      },
    );
  },
};
