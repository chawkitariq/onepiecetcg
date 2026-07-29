/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * Handles Trafalgar Law:
 * 1. If you have 1 or less Life cards, this Character gains [Blocker].
 * 2. [On Play] You may return 1 of your Characters to the owner's hand: Play up to 1
 *    Character card with a cost of 5 or less from your hand rested.
 *
 * The conditional Blocker is a passive continuous effect — it is player-declared
 * per the spec's declarative Blocker model and not enforced server-side.
 */
export const op13031SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-031-special',
  cardId: 'OP13-031',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    const source = host.getCard(event.sourceInstanceId);
    if (!player || !source) return;

    if (player.zones.life.length <= 1) {
      host.addLog(
        '[Trafalgar Law] Condition met — this Character gains [Blocker].',
      );
    }

    const ownChars = host.getCards(
      {
        player: 'self',
        zones: ['characters'],
        filter: { cardCategory: ['Character'] },
        count: { kind: 'upTo', value: 1 },
      },
      event.playerSessionId,
    );

    if (ownChars.length === 0) return;

    anyEngine.decisions.pause(
      {
        id: `${event.sourceInstanceId}:op13-031:confirm`,
        effectId: 'op13-031-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message:
            '[Trafalgar Law] Return 1 Character to hand to play a cost 5 or less Character rested?',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) return;

        anyEngine.decisions.chooseCards(
          `${event.sourceInstanceId}:op13-031:return-char`,
          event.playerSessionId,
          {
            sourceInstanceId: event.sourceInstanceId,
            storedSelections: {},
          },
          event.playerSessionId,
          '[Trafalgar Law] Choose 1 Character to return to hand:',
          {
            player: 'self',
            zones: ['characters'],
            filter: { cardCategory: ['Character'] },
            count: { kind: 'exact', value: 1 },
          },
          undefined,
          (returnCards) => {
            for (const card of returnCards) {
              host.moveCard(card, event.playerSessionId, 'hand');
            }

            anyEngine.decisions.chooseCards(
              `${event.sourceInstanceId}:op13-031:play-char`,
              event.playerSessionId,
              {
                sourceInstanceId: event.sourceInstanceId,
                storedSelections: {},
              },
              event.playerSessionId,
              '[Trafalgar Law] Play up to 1 Character with cost 5 or less rested:',
              {
                player: 'self',
                zones: ['hand'],
                filter: { cardCategory: ['Character'], costMax: 5 },
                count: { kind: 'upTo', value: 1 },
              },
              undefined,
              (playCards) => {
                for (const card of playCards) {
                  host.playCard(card, event.playerSessionId, 'characters');
                  card.rested = true;
                }
                engine.reapplyContinuousEffects();
              },
            );
          },
        );
      },
    );
  },
};
