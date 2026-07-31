/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils.js';

/**
 * OP14-062 Gladius
 * [On K.O.] DON!! 1 (You may return the specified number of DON!! cards from
 * your field to your DON!! deck.): K.O. or rest up to 1 of your opponent's
 * Characters with a base power of 6000 or less.
 */
export const op14062SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-062-special',
  cardId: 'OP14-062',
  resolve(event, engine) {
    if (event.type !== 'onKo') return;
    const anyEngine = engine as any;
    const { host, decisions } = anyEngine;

    const activeDon = host.getCards(
      { player: 'self', zones: ['cost'], filter: { rested: false } },
      event.playerSessionId,
    );
    if (!activeDon.length) return;

    decisions.pause(
      {
        id: `${event.sourceInstanceId}:op14-062:pay-don`,
        effectId: 'op14-062-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message:
            '[Gladius] DON!! 1: Return 1 DON!! to DON!! deck to K.O. or rest 1 opponent Character (6000 base power or less)?',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) return;
        host.returnDonToDonDeck(event.playerSessionId, 1);

        decisions.chooseChoices(
          `${event.sourceInstanceId}:op14-062:ko-or-rest`,
          event.playerSessionId,
          '[Gladius] K.O. or rest?',
          [
            { id: 'ko', label: 'K.O.' },
            { id: 'rest', label: 'Rest' },
          ],
          1,
          1,
          (choiceIds) => {
            const doKo = choiceIds.includes('ko');

            decisions.chooseCards(
              `${event.sourceInstanceId}:op14-062:target`,
              event.playerSessionId,
              {
                sourceInstanceId: event.sourceInstanceId,
                storedSelections: {},
              },
              event.playerSessionId,
              doKo
                ? '[Gladius] Choose up to 1 opponent Character (6000 base power or less) to K.O.:'
                : '[Gladius] Choose up to 1 opponent Character (6000 base power or less) to rest:',
              {
                player: 'opponent',
                zones: ['characters'],
                filter: { cardCategory: ['Character'], basePowerMax: 6000 },
                count: { kind: 'upTo', value: 1 },
              },
              undefined,
              (targets) => {
                for (const card of targets) {
                  if (doKo) {
                    host.koCharacter(
                      card.ownerSessionId,
                      card.instanceId,
                      'effect',
                    );
                  } else {
                    patchSpecialHandlerCardStatus(host, card, {
                      rested: true,
                    });
                  }
                }
                host.syncPlayer(event.playerSessionId);
                engine.reapplyContinuousEffects();
              },
            );
          },
        );
      },
    );
  },
};
