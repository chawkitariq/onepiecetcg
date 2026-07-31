/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

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

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const registry = anyEngine.registry;

    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    const leaderFamilies = Array.from(player.zones.leader.families);
    if (!leaderFamilies.includes('Dressrosa')) return;

    decisions.chooseCards(
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
          host.moveCard(card, event.playerSessionId, 'trash');
          const eventEffects =
            registry.effectsByCardId[card.cardId]?.standard ?? [];
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
          host.syncPlayer(event.playerSessionId);
          const opponentId = host.getOpponentSessionId(event.playerSessionId);
          if (opponentId) host.syncPlayer(opponentId);
        }
      },
    );
  },
};
