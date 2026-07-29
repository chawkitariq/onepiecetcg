/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP14-049 Jinbe
 * When a card is trashed from your hand by an effect, this Character gains
 * [Rush] during this turn.
 * [On Play] You may rest 2 of your DON!! cards: Draw 2 cards and return up to
 * 1 Character with a cost of 7 or less to the owner's hand.
 */
export const op14049SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-049-special',
  cardId: 'OP14-049',
  resolve(event, engine) {
    if (event.type === 'onPlay') {
      const anyEngine = engine as any;
      const { host, decisions } = anyEngine;
      const player = host.getPlayer(event.playerSessionId);
      if (!player) return;

      const activeDon = host.getCards(
        { player: 'self', zones: ['cost'], filter: { rested: false } },
        event.playerSessionId,
      );
      if (activeDon.length < 2) {
        engine.reapplyContinuousEffects();
        return;
      }

      decisions.pause(
        {
          id: `${event.sourceInstanceId}:op14-049:rest-don`,
          effectId: 'op14-049-special',
          effectCardId: event.sourceCardId,
          sourceInstanceId: event.sourceInstanceId,
          playerSessionId: event.playerSessionId,
          createdAt: new Date().toISOString(),
          prompt: {
            type: 'confirm',
            message:
              '[Jinbe] Rest 2 of your DON!! cards? Draw 2 cards and return 1 Character (cost 7 or less) to hand.',
            optional: true,
          },
        },
        (response: { confirmed?: boolean }) => {
          if (!response.confirmed) {
            engine.reapplyContinuousEffects();
            return;
          }
          for (let i = 0; i < 2 && i < activeDon.length; i++) {
            activeDon[i].rested = true;
          }
          host.drawCard(event.playerSessionId);
          host.drawCard(event.playerSessionId);

          decisions.chooseCards(
            `${event.sourceInstanceId}:op14-049:bounce`,
            event.playerSessionId,
            { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
            event.playerSessionId,
            "[Jinbe] Return up to 1 Character (cost 7 or less) to owner's hand:",
            {
              player: 'either',
              zones: ['characters'],
              filter: { cardCategory: ['Character'], costMax: 7 },
              count: { kind: 'upTo', value: 1 },
            },
            undefined,
            (targets) => {
              for (const card of targets) {
                host.moveCard(card, card.ownerSessionId, 'hand');
              }
              host.syncPlayer(event.playerSessionId);
              engine.reapplyContinuousEffects();
            },
          );
        },
      );
    } else if (event.type === 'onCardDrawn') {
      const anyEngine = engine as any;
      const { host } = anyEngine;
      const source = host.getCard(event.sourceInstanceId);
      if (!source) return;
      anyEngine.modifiers.addKeywordModifier(
        event.sourceInstanceId,
        event.playerSessionId,
        event.sourceInstanceId,
        ['rush'],
        'untilEndOfTurn',
      );
      engine.reapplyContinuousEffects();
    }
  },
};
