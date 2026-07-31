/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

/**
 * OP15-014 "Bartolomeo"
 * If this Character would be K.O.'d, you may trash 1 Event from your hand
 * instead (handled as a replacement effect in op15.effects.ts).
 * [On Play] Activate up to 1 {Dressrosa} type Event with a base cost of 3 or
 * less from your hand.
 */
export const op15014SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-014-special',
  cardId: 'OP15-014',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const registry = anyEngine.registry;

    decisions.chooseCards(
      `${event.sourceInstanceId}:op15-014:select-event`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Bartolomeo] Select a Dressrosa Event with base cost 3 or less to activate:',
      {
        player: 'self',
        zones: ['hand'],
        filter: {
          cardCategory: ['Event'],
          trait: ['Dressrosa'],
          baseCostMax: 3,
        },
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
