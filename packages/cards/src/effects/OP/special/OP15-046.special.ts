import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP15-046 "Sabo"
 * [Blocker]
 * [On Play] If your Leader has the {Dressrosa} type, activate up to 1
 * {Dressrosa} type Event from your hand.
 */
export const op15046SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-046-special',
  cardId: 'OP15-046',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;

    const leaderFamilies = Array.from(player.zones.leader.families);
    if (!leaderFamilies.includes('Dressrosa')) return;

    engine.chooseCards(
      `${event.sourceInstanceId}:op15-046:select-event`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Sabo] Select a Dressrosa Event to activate:',
      {
        player: 'self',
        zones: ['hand'],
        filter: { cardCategory: ['Event'], trait: ['Dressrosa'] },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (cards) => {
        for (const card of cards) {
          engine.moveCard(card, event.playerSessionId, 'trash');
          const eventEffects =
            engine.effectsByCardId[card.cardId]?.standard ?? [];
          for (const effectDef of eventEffects) {
            engine.queueEffect(
              event.playerSessionId,
              card.instanceId,
              card.cardId,
              effectDef,
            );
          }
        }
        if (cards.length > 0) {
          engine.syncPlayer(event.playerSessionId);
          const opponentId = engine.getOpponentSessionId(event.playerSessionId);
          if (opponentId) engine.syncPlayer(opponentId);
        }
      },
    );
  },
};
