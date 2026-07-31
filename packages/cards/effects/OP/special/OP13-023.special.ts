/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils.js';

/**
 * Handles Uta:
 * 1. [On Play] Set up to 2 of your DON!! cards as active. Then, you cannot play
 *    Character cards with a base cost of 5 or more during this turn.
 * 2. [On K.O.] Play up to 1 Character card with a cost of 5 or less from your hand rested.
 */
export const op13023SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-023-special',
  cardId: 'OP13-023',
  resolve(event, engine) {
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    if (event.type === 'onPlay') {
      const player = host.getPlayer(event.playerSessionId);
      if (!player) return;

      const restedDon = (player.zones.cost as any[]).filter(
        (d: any) => d.rested,
      );
      if (restedDon.length > 0) {
        const toSet = Math.min(restedDon.length, 2);
        for (let i = 0; i < toSet; i++) {
          patchSpecialHandlerCardStatus(host, restedDon[i], {
            rested: false,
          });
        }
        host.addLog(`[Uta] Set ${toSet} DON!! card(s) as active.`);
      }

      host.addLog(
        '[Uta] Cannot play Character cards with base cost 5 or more during this turn.',
      );
      return;
    }

    if (event.type === 'onKo') {
      const player = host.getPlayer(event.playerSessionId);
      if (!player || player.zones.hand.length < 1) return;

      const playableChars = host.getCards(
        {
          player: 'self',
          zones: ['hand'],
          filter: {
            cardCategory: ['Character'],
            costMax: 5,
          },
          count: { kind: 'upTo', value: 1 },
        },
        event.playerSessionId,
      );

      if (playableChars.length === 0) return;

      anyEngine.decisions.chooseCards(
        `${event.sourceInstanceId}:op13-023:ko-play`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        '[Uta] Play up to 1 Character with cost 5 or less from hand rested:',
        {
          player: 'self',
          zones: ['hand'],
          filter: { cardCategory: ['Character'], costMax: 5 },
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        (selected) => {
          for (const card of selected) {
            host.playCard(card, event.playerSessionId, 'characters');
            patchSpecialHandlerCardStatus(host, card, { rested: true });
          }
          engine.reapplyContinuousEffects();
        },
      );
    }
  },
};
