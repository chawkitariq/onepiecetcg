/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP10-026
 * [Activate: Main] Place this card and 1 Kin'emon (0 power) from your
 * trash at the bottom of your deck: Play 1 Kin'emon with cost 6 from your hand.
 */
export const op10026SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-026-special',
  cardId: 'OP10-026',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;
    decisions.chooseCards(
      `${event.sourceInstanceId}:op10-026:kinemon-trash`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      "Choose 1 Kin'emon (0 power) from your trash:",
      {
        player: 'self',
        zones: ['trash'],
        filter: {
          name: ["Kin'emon"],
          cardCategory: ['Character'],
          powerMax: 0,
        },
        count: { kind: 'exact', value: 1 },
      },
      undefined,
      (trashCards) => {
        const kinemonFromTrash = trashCards[0];
        if (!kinemonFromTrash) {
          engine.reapplyContinuousEffects();
          return;
        }
        if (host.getCard(event.sourceInstanceId)) {
          host.moveCard(source, event.playerSessionId, 'deck', {
            toBottom: true,
          });
        }
        host.moveCard(kinemonFromTrash, event.playerSessionId, 'deck', {
          toBottom: true,
        });
        decisions.chooseCards(
          `${event.sourceInstanceId}:op10-026:kinemon-hand`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          "Play 1 Kin'emon (cost 6) from your hand:",
          {
            player: 'self',
            zones: ['hand'],
            filter: {
              name: ["Kin'emon"],
              cardCategory: ['Character'],
              costMin: 6,
              costMax: 6,
            },
            count: { kind: 'upTo', value: 1 },
          },
          undefined,
          (handCards) => {
            for (const card of handCards) {
              host.playCard(card, event.playerSessionId, 'characters');
            }
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
