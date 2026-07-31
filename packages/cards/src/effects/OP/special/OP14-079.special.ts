import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { createOncePerTurnKey } from '../../special-handler-utils.js';

/**
 * OP14-079 Crocodile
 * All of your opponent's Characters cannot be removed from the field by your
 * effects.
 * [Activate: Main] [Once Per Turn] You may K.O. 1 of your Characters with a
 * type including "Baroque Works": Give up to 1 of your opponent's Characters
 * -10 cost during this turn. Then, you may trash 2 cards from the top of your
 * deck.
 */
export const op14079SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-079-special',
  cardId: 'OP14-079',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const turn = engine.state.turn;
    if (
      engine.hasResolvedOncePerTurnKey(
        createOncePerTurnKey(event.sourceInstanceId, 'op14-079', turn),
      )
    )
      return;

    engine.chooseCards(
      `${event.sourceInstanceId}:op14-079:ko-own`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Crocodile] K.O. 1 of your Characters with "Baroque Works" type:',
      {
        player: 'self',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], trait: ['Baroque Works'] },
        count: { kind: 'exact', value: 1 },
      },
      undefined,
      (ownCards) => {
        if (!ownCards.length) return;
        engine.markResolvedOncePerTurnKey(
          createOncePerTurnKey(event.sourceInstanceId, 'op14-079', turn),
        );

        for (const card of ownCards) {
          engine.koCharacter(card.ownerSessionId, card.instanceId, 'effect');
        }

        engine.chooseCards(
          `${event.sourceInstanceId}:op14-079:cost-down`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          '[Crocodile] Give up to 1 opponent Character -10 cost during this turn:',
          {
            player: 'opponent',
            zones: ['characters'],
            filter: { cardCategory: ['Character'] },
            count: { kind: 'upTo', value: 1 },
          },
          undefined,
          (oppTargets) => {
            for (const card of oppTargets) {
              engine.addCostModifier(
                event.sourceInstanceId,
                event.playerSessionId,
                card.instanceId,
                -10,
                'untilEndOfTurn',
              );
            }

            engine.pauseDecision(
              {
                id: `${event.sourceInstanceId}:op14-079:trash-deck`,
                effectId: 'op14-079-special',
                effectCardId: event.sourceCardId,
                sourceInstanceId: event.sourceInstanceId,
                playerSessionId: event.playerSessionId,
                createdAt: new Date().toISOString(),
                prompt: {
                  type: 'confirm',
                  message:
                    '[Crocodile] Trash 2 cards from the top of your deck?',
                  optional: true,
                },
              },
              (trashResp: { confirmed?: boolean }) => {
                if (trashResp.confirmed) {
                  engine.trashTopDeckCards(event.playerSessionId, 2);
                }
                engine.syncPlayer(event.playerSessionId);
                engine.reapplyContinuousEffects();
              },
            );
          },
        );
      },
    );
  },
};
