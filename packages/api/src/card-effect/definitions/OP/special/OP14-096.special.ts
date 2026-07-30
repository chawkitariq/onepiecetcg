/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils';

/**
 * OP14-096 Ground Death
 * [Main] You may rest 2 of your DON!! cards: Negate the effect of up to 1 of
 * your opponent's Characters with a cost of 5 or less during this turn.
 * [Counter] If you have 10 or more cards in your trash, up to 1 of your Leader
 * or Character cards gains +4000 power during this battle.
 */
export const op14096SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-096-special',
  cardId: 'OP14-096',
  resolve(event, engine) {
    if (event.type === 'activateMain') {
      const anyEngine = engine as any;
      const { host, decisions } = anyEngine;
      const player = host.getPlayer(event.playerSessionId);
      if (!player) return;

      const activeDon = host.getCards(
        { player: 'self', zones: ['cost'], filter: { rested: false } },
        event.playerSessionId,
      );
      if (activeDon.length < 2) return;

      decisions.pause(
        {
          id: `${event.sourceInstanceId}:op14-096:rest-don`,
          effectId: 'op14-096-special',
          effectCardId: event.sourceCardId,
          sourceInstanceId: event.sourceInstanceId,
          playerSessionId: event.playerSessionId,
          createdAt: new Date().toISOString(),
          prompt: {
            type: 'confirm',
            message:
              '[Ground Death] Rest 2 of your DON!! to negate 1 opponent Character (cost 5 or less)?',
            optional: true,
          },
        },
        (resp: { confirmed?: boolean }) => {
          if (!resp.confirmed) return;
          for (let i = 0; i < 2 && i < activeDon.length; i++) {
            patchSpecialHandlerCardStatus(host, activeDon[i], {
              rested: true,
            });
          }

          decisions.chooseCards(
            `${event.sourceInstanceId}:op14-096:negate`,
            event.playerSessionId,
            { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
            event.playerSessionId,
            '[Ground Death] Choose up to 1 opponent Character (cost 5 or less). Their effects are negated this turn:',
            {
              player: 'opponent',
              zones: ['characters'],
              filter: { cardCategory: ['Character'], costMax: 5 },
              count: { kind: 'upTo', value: 1 },
            },
            undefined,
            (selected) => {
              for (const card of selected) {
                patchSpecialHandlerCardStatus(host, card, {
                  effectNegated: true,
                });
              }
              host.syncPlayer(event.playerSessionId);
              engine.reapplyContinuousEffects();
            },
          );
        },
      );
    } else if (event.type === 'activateCounter') {
      const anyEngine = engine as any;
      const { host, decisions } = anyEngine;
      const player = host.getPlayer(event.playerSessionId);
      if (!player) return;

      if (player.zones.trash.length < 10) return;

      decisions.chooseCards(
        `${event.sourceInstanceId}:op14-096:power-up`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        '[Ground Death] Choose up to 1 of your Leader or Character cards to gain +4000 power during this battle:',
        {
          player: 'self',
          zones: ['leader', 'characters'],
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        (selected) => {
          for (const card of selected) {
            anyEngine.modifiers.addPowerModifier(
              event.sourceInstanceId,
              event.playerSessionId,
              card.instanceId,
              4000,
              'untilEndOfBattle',
            );
          }
          engine.reapplyContinuousEffects();
        },
      );
    }
  },
};
