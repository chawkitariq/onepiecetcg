/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils.js';

/**
 * OP14-069 Donquixote Doflamingo
 * [On Play] DON!! -3: Choose one:
 * • If your Leader has the {Donquixote Pirates} type, K.O. up to 1 of your
 *   opponent's Characters with a cost of 8 or less.
 * • Up to 3 of your opponent's Characters with a cost of 7 or less cannot be
 *   rested until the end of your opponent's next End Phase.
 */
export const op14069SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-069-special',
  cardId: 'OP14-069',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;

    const activeDon = engine.getCards(
      { player: 'self', zones: ['cost'], filter: { rested: false } },
      event.playerSessionId,
    );
    if (activeDon.length < 3) return;

    engine.pauseDecision(
      {
        id: `${event.sourceInstanceId}:op14-069:pay-don`,
        effectId: 'op14-069-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message: '[Doflamingo] DON!! -3 to activate effect?',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) return;
        engine.returnDonToDonDeck(event.playerSessionId, 3);

        const leader = player.zones.leader;
        const isDonqui = (leader.families || []).some((f: string) =>
          f.includes('Donquixote'),
        );

        const choices: Array<{ id: string; label: string }> = [];
        if (isDonqui) {
          choices.push({
            id: 'ko',
            label: 'K.O. up to 1 opponent Character (cost 8 or less)',
          });
        }
        choices.push({
          id: 'no-rest',
          label:
            'Up to 3 opponent Characters (cost 7 or less) cannot be rested',
        });

        engine.chooseChoices(
          `${event.sourceInstanceId}:op14-069:mode`,
          event.playerSessionId,
          '[Doflamingo] Choose one:',
          choices,
          1,
          1,
          (choiceIds) => {
            if (choiceIds.includes('ko')) {
              engine.chooseCards(
                `${event.sourceInstanceId}:op14-069:ko-target`,
                event.playerSessionId,
                {
                  sourceInstanceId: event.sourceInstanceId,
                  storedSelections: {},
                },
                event.playerSessionId,
                '[Doflamingo] K.O. up to 1 opponent Character (cost 8 or less):',
                {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 8 },
                  count: { kind: 'upTo', value: 1 },
                },
                undefined,
                (cards) => {
                  for (const card of cards) {
                    engine.koCharacter(card.ownerSessionId, card.instanceId, 'effect');
                  }
                  engine.syncPlayer(event.playerSessionId);
                  engine.reapplyContinuousEffects();
                },
              );
            } else {
              engine.chooseCards(
                `${event.sourceInstanceId}:op14-069:prevent-rest`,
                event.playerSessionId,
                {
                  sourceInstanceId: event.sourceInstanceId,
                  storedSelections: {},
                },
                event.playerSessionId,
                "[Doflamingo] Select up to 3 opponent Characters (cost 7 or less). They cannot be rested until end of opponent's next End Phase:",
                {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 7 },
                  count: { kind: 'upTo', value: 3 },
                },
                undefined,
                (selected) => {
                  for (const card of selected) {
                    patchSpecialHandlerCardStatus(engine, card, {
                      skipNextRefreshPhases:
                        (card.skipNextRefreshPhases || 0) + 1,
                    });
                  }
                  engine.syncPlayer(event.playerSessionId);
                  engine.reapplyContinuousEffects();
                },
              );
            }
          },
        );
      },
    );
  },
};
