import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP09-059 "Murder at the Steam Bath"
 * [Counter] Up to 1 of your Leader or Character cards gains +3000 power during
 *   this battle. Then, trash up to 2 cards from your hand. Trash the same
 *   number of cards from the top of your deck as you did from your hand.
 * [Trigger] Draw 1 card.
 */
export const op09059SpecialHandler: SpecialHandlerDefinition = {
  id: 'op09-059-special',
  cardId: 'OP09-059',
  resolve(event, engine) {
    if (event.type === 'activateCounter') {
      engine.chooseCards(
        `${event.sourceInstanceId}:op09-059:power`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        '[Murder at the Steam Bath] Choose up to 1 of your Leader or Characters to gain +3000 power:',
        {
          player: 'self',
          zones: ['leader', 'characters'],
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        (powerTargets) => {
          for (const card of powerTargets) {
            engine.addPowerModifier(
              event.sourceInstanceId,
              event.playerSessionId,
              card.instanceId,
              3000,
              'untilEndOfBattle',
            );
          }
          engine.reapplyContinuousEffects();

          engine.chooseCards(
            `${event.sourceInstanceId}:op09-059:trash-hand`,
            event.playerSessionId,
            { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
            event.playerSessionId,
            '[Murder at the Steam Bath] Trash up to 2 cards from your hand:',
            {
              player: 'self',
              zones: ['hand'],
              count: { kind: 'upTo', value: 2 },
            },
            undefined,
            (trashed) => {
              const amount = trashed.length;
              for (const card of trashed) {
                engine.moveCard(card, event.playerSessionId, 'trash');
              }
              if (amount > 0) {
                engine.trashTopDeckCards(event.playerSessionId, amount);
              }
              engine.syncPlayer(event.playerSessionId);
            },
          );
        },
      );
    } else if (event.type === 'trigger') {
      engine.drawCard(event.playerSessionId);
      engine.syncPlayer(event.playerSessionId);
    }
  },
};
