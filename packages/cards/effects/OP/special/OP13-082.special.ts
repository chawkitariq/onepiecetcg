/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils.js';

/**
 * Handles Five Elders:
 * [Activate: Main] If your Leader is [Imu], you may rest 1 of your DON!! cards and
 * trash 1 card from your hand: Trash all of your Characters and play up to 5
 * "Five Elders" type Character cards with 5000 power and different card names
 * from your trash.
 */
export const op13082SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-082-special',
  cardId: 'OP13-082',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    const source = host.getCard(event.sourceInstanceId);
    if (!player || !source) return;

    const leader = player.zones.leader;
    if (!leader || leader.name !== 'Imu') return;

    const activeDon = player.zones.cost.filter((d: any) => !d.rested);
    if (activeDon.length < 1 || player.zones.hand.length < 1) return;

    const fiveEldersInTrash = host.getCards(
      {
        player: 'self',
        zones: ['trash'],
        filter: {
          cardCategory: ['Character'],
          trait: ['Five Elders'],
          powerMin: 5000,
          powerMax: 5000,
        },
        count: { kind: 'upTo', value: 5 },
      },
      event.playerSessionId,
    );

    const uniqueNames = new Set<string>();
    for (const card of fiveEldersInTrash) {
      uniqueNames.add(card.name);
    }

    if (uniqueNames.size < 1) return;

    anyEngine.decisions.pause(
      {
        id: `${event.sourceInstanceId}:op13-082:confirm`,
        effectId: 'op13-082-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message:
            '[Five Elders] Rest 1 DON!!, trash 1 hand, trash all Characters, play up to 5 Five Elders from trash?',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) return;

        patchSpecialHandlerCardStatus(host, activeDon[0], { rested: true });

        anyEngine.decisions.chooseCards(
          `${event.sourceInstanceId}:op13-082:trash-hand`,
          event.playerSessionId,
          {
            sourceInstanceId: event.sourceInstanceId,
            storedSelections: {},
          },
          event.playerSessionId,
          '[Five Elders] Choose 1 card from hand to trash:',
          {
            player: 'self',
            zones: ['hand'],
            count: { kind: 'exact', value: 1 },
          },
          undefined,
          (handCards) => {
            for (const card of handCards) {
              host.moveCard(card, event.playerSessionId, 'trash');
            }

            const ownChars = [...player.zones.characters];
            for (const char of ownChars) {
              host.moveCard(char, event.playerSessionId, 'trash');
            }

            host.addLog('[Five Elders] All your Characters trashed.');

            const available = host.getCards(
              {
                player: 'self',
                zones: ['trash'],
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Five Elders'],
                  powerMin: 5000,
                  powerMax: 5000,
                },
                count: { kind: 'upTo', value: 5 },
              },
              event.playerSessionId,
            );

            const nameGroups = new Map<string, typeof available>();
            for (const c of available) {
              const existing = nameGroups.get(c.name) ?? [];
              existing.push(c);
              nameGroups.set(c.name, existing);
            }

            const selectableNames = [...nameGroups.keys()];

            anyEngine.decisions.chooseChoices(
              `${event.sourceInstanceId}:op13-082:select-elders`,
              event.playerSessionId,
              '[Five Elders] Choose which Five Elders characters to play (up to 5, different names):',
              selectableNames.map((n) => ({
                id: n,
                label: n,
              })),
              1,
              Math.min(5, selectableNames.length),
              (chosenNames) => {
                for (const name of chosenNames) {
                  const group = nameGroups.get(name);
                  if (group && group.length > 0) {
                    const card = group[0];
                    host.playCard(card, event.playerSessionId, 'characters');
                  }
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
