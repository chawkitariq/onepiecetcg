/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * Handles Portgas.D.Ace (119):
 * 1. If you have 3 or less Life cards, this Character gains [Rush].
 * 2. [On Play] Give up to 1 rested DON!! card to your Leader. Then, you may return
 *    up to 1 of your opponent's Characters with a cost of 5 or less to the owner's
 *    hand. If you do, your opponent plays up to 1 Character card with a cost of 4
 *    or less from their hand.
 */
export const op13119SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-119-special',
  cardId: 'OP13-119',
  resolve(event, engine) {
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    if (
      event.type === 'onPlay' ||
      event.type === 'onTurnStart' ||
      event.type === 'onLifeDamageDealt'
    ) {
      const player = host.getPlayer(event.playerSessionId);
      if (!player) return;

      if (player.zones.life.length <= 3) {
        anyEngine.modifiers.addKeywordModifier(
          event.sourceInstanceId,
          event.playerSessionId,
          event.sourceInstanceId,
          'rush',
          'untilEndOfTurn',
        );
        host.addLog('[Portgas.D.Ace 119] 3 or less Life cards — gains [Rush].');
        engine.reapplyContinuousEffects();
      }
      return;
    }

    if (event.type !== 'activateMain') return;

    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    const donDeckCount = player.zones.donDeck.length;
    if (donDeckCount >= 1) {
      const def: StandardEffectDefinition = {
        id: 'op13-119-attach-don-leader',
        text: 'Give up to 1 rested DON!! card to your Leader.',
        trigger: { type: 'onPlay' },
        actions: [
          {
            type: 'attachDon',
            player: 'self',
            selector: {
              player: 'self',
              zones: ['leader'],
              count: { kind: 'exact', value: 1 },
            },
            amount: 1,
            rested: true,
          },
        ],
      };

      engine.queueEffect(
        event.playerSessionId,
        event.sourceInstanceId,
        event.sourceCardId,
        def,
      );
    }

    const opponentId = host.getOpponentSessionId(event.playerSessionId);
    const opponent = opponentId ? host.getPlayer(opponentId) : undefined;

    if (!opponent || opponent.zones.characters.length === 0) return;

    anyEngine.decisions.pause(
      {
        id: `${event.sourceInstanceId}:op13-119:confirm-return`,
        effectId: 'op13-119-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message:
            '[Portgas.D.Ace 119] Return opponent Character (cost 5 or less) to hand? Opponent then plays a cost 4 or less from hand.',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) return;

        anyEngine.decisions.chooseCards(
          `${event.sourceInstanceId}:op13-119:return-target`,
          event.playerSessionId,
          {
            sourceInstanceId: event.sourceInstanceId,
            storedSelections: {},
          },
          event.playerSessionId,
          '[Portgas.D.Ace 119] Choose up to 1 opponent Character (cost 5 or less) to return to hand:',
          {
            player: 'opponent',
            zones: ['characters'],
            filter: {
              cardCategory: ['Character'],
              costMax: 5,
            },
            count: { kind: 'upTo', value: 1 },
          },
          undefined,
          (returned) => {
            for (const card of returned) {
              host.moveCard(card, card.ownerSessionId, 'hand');
            }

            if (returned.length > 0 && opponent.zones.hand.length > 0) {
              const opponentHand = host.getCards(
                {
                  player: 'opponent',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 4,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                event.playerSessionId,
              );

              if (opponentHand.length > 0) {
                const picked = opponentHand[0];
                host.playCard(picked, opponent.sessionId, 'characters');
                host.addLog(
                  `[Portgas.D.Ace 119] Opponent plays ${picked.name} from hand.`,
                );
              }
            }

            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
