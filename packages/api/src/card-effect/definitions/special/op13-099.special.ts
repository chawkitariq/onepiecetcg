/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * Handles The Empty Throne:
 * 1. [Your Turn] If you have 19 or more cards in your trash, your Leader gains
 *    +1000 power.
 * 2. [Activate: Main] You may rest this card and 3 of your DON!! cards: Play up to 1
 *    black "Five Elders" type Character card with a cost equal to or less than the
 *    number of DON!! cards on your field from your hand.
 */
export const op13099SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-099-special',
  cardId: 'OP13-099',
  resolve(event, engine) {
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    if (
      event.type === 'onPlay' ||
      event.type === 'onTurnStart' ||
      event.type === 'onCardDrawn'
    ) {
      const player = host.getPlayer(event.playerSessionId);
      if (!player) return;

      const isYourTurn = host.state.turnPlayer === event.playerSessionId;
      if (!isYourTurn) return;

      const trashCount = player.zones.trash.length;
      if (trashCount >= 19) {
        const def: StandardEffectDefinition = {
          id: 'op13-099-leader-power-trash-19',
          text: 'If you have 19+ cards in trash, Leader gains +1000 power.',
          trigger: { type: event.type },
          actions: [
            {
              type: 'modifyPower',
              selector: {
                player: 'self',
                zones: ['leader'],
                count: { kind: 'exact', value: 1 },
              },
              amount: 1000,
              duration: { type: 'untilEndOfTurn' },
            },
          ],
        };

        engine.queueEffect(
          event.playerSessionId,
          event.sourceInstanceId,
          event.sourceCardId,
          def,
        );
      }
      return;
    }

    if (event.type !== 'activateMain') return;

    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    const activeDon = player.zones.cost.filter((d: any) => !d.rested);
    if (activeDon.length < 3) return;

    const isRested = source.rested;
    if (isRested) return;

    const totalDonOnField =
      player.zones.cost.length +
      (player.zones.leader.attachedDon || 0) +
      (player.zones.characters as any[]).reduce(
        (sum: number, c: any) => sum + (Number(c.attachedDon) || 0),
        0,
      );

    const playableChars = host.getCards(
      {
        player: 'self',
        zones: ['hand'],
        filter: {
          cardCategory: ['Character'],
          colors: ['Black'],
          trait: ['Five Elders'],
          costMax: totalDonOnField,
        },
        count: { kind: 'upTo', value: 1 },
      },
      event.playerSessionId,
    );

    if (playableChars.length === 0) return;

    anyEngine.decisions.pause(
      {
        id: `${event.sourceInstanceId}:op13-099:confirm`,
        effectId: 'op13-099-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message:
            '[The Empty Throne] Rest this card and 3 DON!! to play a Five Elders from hand?',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) return;

        source.rested = true;
        for (let i = 0; i < 3; i++) {
          if (activeDon[i]) {
            activeDon[i].rested = true;
          }
        }

        anyEngine.decisions.chooseCards(
          `${event.sourceInstanceId}:op13-099:play-char`,
          event.playerSessionId,
          {
            sourceInstanceId: event.sourceInstanceId,
            storedSelections: {},
          },
          event.playerSessionId,
          `[The Empty Throne] Play up to 1 black Five Elders (cost <= ${totalDonOnField}) from hand:`,
          {
            player: 'self',
            zones: ['hand'],
            filter: {
              cardCategory: ['Character'],
              colors: ['Black'],
              trait: ['Five Elders'],
              costMax: totalDonOnField,
            },
            count: { kind: 'upTo', value: 1 },
          },
          undefined,
          (selected) => {
            for (const card of selected) {
              host.playCard(card, event.playerSessionId, 'characters');
            }
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
