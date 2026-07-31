import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils.js';

/**
 * OP15-059 "Amazon"
 * [On Your Opponent's Attack] You may rest this Character: Your opponent may
 * return 1 of their active DON!! cards to their DON!! deck. If they do not,
 * give up to 1 of your opponent's Leader or Character cards 2000 power during
 * this turn.
 */
export const op15059SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-059-special',
  cardId: 'OP15-059',
  resolve(event, engine) {
    if (event.type !== 'onAttacked') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    const source = host.getCard(event.sourceInstanceId);
    if (!source || source.rested) return;

    decisions.pause(
      {
        id: `${event.sourceInstanceId}:op15-059:rest-self`,
        effectId: 'op15-059-rest-self',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message: '[Amazon] Rest this Character to activate?',
          optional: true,
        },
      },
      (response) => {
        if (!response.confirmed) {
          engine.reapplyContinuousEffects();
          return;
        }

        patchSpecialHandlerCardStatus(host, source, { rested: true });

        const opponentId = host.getOpponentSessionId(event.playerSessionId);
        if (!opponentId) {
          engine.reapplyContinuousEffects();
          return;
        }

        const opponent = host.getPlayer(opponentId);
        const hasActiveDon =
          opponent &&
          Array.from(opponent.zones.cost).some((c: any) => !c.rested);

        if (!hasActiveDon) {
          // Opponent has no active DON!!, they cannot return, so give +2000
          decisions.chooseCards(
            `${event.sourceInstanceId}:op15-059:power-target`,
            event.playerSessionId,
            {
              sourceInstanceId: event.sourceInstanceId,
              storedSelections: {},
            },
            event.playerSessionId,
            '[Amazon] Give +2000 power to 1 opponent Leader or Character:',
            {
              player: 'opponent',
              zones: ['leader', 'characters'],
              count: { kind: 'upTo', value: 1 },
            },
            undefined,
            (targets) => {
              for (const target of targets) {
                anyEngine.modifiers.addPowerModifier(
                  event.sourceInstanceId,
                  event.playerSessionId,
                  target.instanceId,
                  2000,
                  'untilEndOfTurn',
                );
              }
              host.syncPlayer(event.playerSessionId);
              host.syncPlayer(opponentId);
              engine.reapplyContinuousEffects();
            },
          );
          return;
        }

        // Ask opponent: return active DON!! or give +2000?
        decisions.chooseChoices(
          `${event.sourceInstanceId}:op15-059:opponent-choice`,
          opponentId,
          '[Amazon] Opponent: return 1 active DON!! to deck, or give +2000 power to one of your cards?',
          [
            { id: 'return', label: 'Return 1 active DON!! to deck' },
            { id: 'give-power', label: 'Give +2000 to one of your cards' },
          ],
          1,
          1,
          (choiceIds) => {
            if (choiceIds.includes('return')) {
              host.returnDonToDonDeck(opponentId, 1);
              host.syncPlayer(event.playerSessionId);
              host.syncPlayer(opponentId);
              engine.reapplyContinuousEffects();
              return;
            }

            decisions.chooseCards(
              `${event.sourceInstanceId}:op15-059:power-target`,
              event.playerSessionId,
              {
                sourceInstanceId: event.sourceInstanceId,
                storedSelections: {},
              },
              event.playerSessionId,
              '[Amazon] Give +2000 power to 1 opponent Leader or Character:',
              {
                player: 'opponent',
                zones: ['leader', 'characters'],
                count: { kind: 'upTo', value: 1 },
              },
              undefined,
              (targets) => {
                for (const target of targets) {
                  anyEngine.modifiers.addPowerModifier(
                    event.sourceInstanceId,
                    event.playerSessionId,
                    target.instanceId,
                    2000,
                    'untilEndOfTurn',
                  );
                }
                host.syncPlayer(event.playerSessionId);
                host.syncPlayer(opponentId);
                engine.reapplyContinuousEffects();
              },
            );
          },
        );
      },
    );
  },
};
