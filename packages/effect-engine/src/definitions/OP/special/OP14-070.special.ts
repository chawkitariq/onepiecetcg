/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils';

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
    const source = engine.getCard(event.sourceInstanceId);
    if (!source || !source.rested) return;

    const donOnField = engine.getCards(
      { player: 'self', zones: ['cost'] },
      event.playerSessionId,
    );
    if (!donOnField.length) {
      engine.reapplyContinuousEffects();
      return;
    }

    engine.pauseDecision(
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
        engine.returnDonToDonDeck(event.playerSessionId, 1);
        patchSpecialHandlerCardStatus(engine, source, { rested: false });
        engine.syncPlayer(event.playerSessionId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
