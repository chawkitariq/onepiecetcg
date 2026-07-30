/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

/**
 * Handles St. Marcus Mars:
 * 1. If you have 7 or more cards in your trash, this Character cannot be removed
 *    from the field by your opponent's effects and gains [Blocker].
 * 2. [On Play] You may trash 1 card from your hand: K.O. up to 1 of your opponent's
 *    Characters with a base cost of 5 or less.
 */
export const op13091SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-091-special',
  cardId: 'OP13-091',
  resolve(event, engine) {
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    if (
      event.type === 'onPlay' ||
      event.type === 'onTurnStart' ||
      event.type === 'onCardDrawn'
    ) {
      const player = host.getPlayer(event.playerSessionId);
      if (!player) return;

      const trashCount = player.zones.trash.length;
      if (trashCount >= 7) {
        anyEngine.modifiers.addKeywordModifier(
          event.sourceInstanceId,
          event.playerSessionId,
          event.sourceInstanceId,
          ['cannotBeRemovedByOpponentEffects'],
          'untilEndOfTurn',
        );

        host.addLog(
          '[St. Marcus Mars] 7+ cards in trash — cannot be removed by opponent effects and gains [Blocker].',
        );
        engine.reapplyContinuousEffects();
      }
    }

    if (event.type !== 'onPlay') return;

    const player = host.getPlayer(event.playerSessionId);
    if (!player || player.zones.hand.length < 1) return;

    anyEngine.decisions.pause(
      {
        id: `${event.sourceInstanceId}:op13-091:confirm`,
        effectId: 'op13-091-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message:
            '[St. Marcus Mars] Trash 1 card from hand to K.O. opponent Character (cost 5 or less)?',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) return;

        anyEngine.decisions.chooseCards(
          `${event.sourceInstanceId}:op13-091:trash-hand`,
          event.playerSessionId,
          {
            sourceInstanceId: event.sourceInstanceId,
            storedSelections: {},
          },
          event.playerSessionId,
          '[St. Marcus Mars] Choose 1 card from hand to trash:',
          {
            player: 'self',
            zones: ['hand'],
            count: { kind: 'exact', value: 1 },
          },
          undefined,
          (trashed) => {
            for (const card of trashed) {
              host.moveCard(card, event.playerSessionId, 'trash');
            }

            const def: StandardEffectDefinition = {
              id: 'op13-091-ko-cost-5',
              text: 'K.O. up to 1 opponent Character with base cost 5 or less.',
              trigger: { type: 'onPlay' },
              actions: [
                {
                  type: 'ko',
                  selector: {
                    player: 'opponent',
                    zones: ['characters'],
                    filter: {
                      cardCategory: ['Character'],
                      costMax: 5,
                    },
                    count: { kind: 'upTo', value: 1 },
                  },
                  reason: 'effect',
                },
              ],
            };

            engine.queueEffect(
              event.playerSessionId,
              event.sourceInstanceId,
              event.sourceCardId,
              def,
            );
          },
        );
      },
    );
  },
};
