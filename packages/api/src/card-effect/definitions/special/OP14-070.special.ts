/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP14-070 Buffalo
 * When this Character becomes rested by your opponent's Character's effect,
 * you may return 1 DON!! card from your field to your DON!! deck. If you do,
 * set this Character as active.
 * [Blocker]
 */
export const op14070SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-070-special',
  cardId: 'OP14-070',
  resolve(event, engine) {
    if (event.type !== 'onDonAttached' && event.type !== 'onPlay') return;
    const anyEngine = engine as any;
    const { host, decisions } = anyEngine;
    const source = host.getCard(event.sourceInstanceId);
    if (!source || !source.rested) return;

    const donOnField = host.getCards(
      { player: 'self', zones: ['cost'] },
      event.playerSessionId,
    );
    if (!donOnField.length) {
      engine.reapplyContinuousEffects();
      return;
    }

    decisions.pause(
      {
        id: `${event.sourceInstanceId}:op14-070:return-don`,
        effectId: 'op14-070-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message:
            '[Buffalo] Return 1 DON!! from your field to DON!! deck to set this Character as active?',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) return;
        host.returnDonToDonDeck(event.playerSessionId, 1);
        source.rested = false;
        host.syncPlayer(event.playerSessionId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
