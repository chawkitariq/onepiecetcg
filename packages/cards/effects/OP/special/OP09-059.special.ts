/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
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
      const anyEngine = engine as any;
      const host = anyEngine.host;
      const decisions = anyEngine.decisions;

      decisions.chooseCards(
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
            anyEngine.modifiers.addPowerModifier(
              event.sourceInstanceId,
              event.playerSessionId,
              card.instanceId,
              3000,
              'untilEndOfBattle',
            );
          }
          engine.reapplyContinuousEffects();

          decisions.chooseCards(
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
                host.moveCard(card, event.playerSessionId, 'trash');
              }
              if (amount > 0) {
                host.trashTopDeckCards(event.playerSessionId, amount);
              }
              host.syncPlayer(event.playerSessionId);
            },
          );
        },
      );
    } else if (event.type === 'trigger') {
      const anyEngine = engine as any;
      const host = anyEngine.host;
      host.drawCard(event.playerSessionId);
      host.syncPlayer(event.playerSessionId);
    }
  },
};
