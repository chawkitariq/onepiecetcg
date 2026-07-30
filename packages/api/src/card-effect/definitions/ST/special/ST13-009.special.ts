/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { DuelCard } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

/**
 * Shanks (ST13-009) special handler.
 *
 * [On Play] You may turn 1 of your face-up Life cards face-down: If your
 * opponent has 7 or more cards in their hand, trash up to 1 card from the
 * top of your opponent's Life cards.
 */
export const st13009SpecialHandler: SpecialHandlerDefinition = {
  id: 'st13-009-special',
  cardId: 'ST13-009',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    const faceUpLife = Array.from(player.zones.life).filter(
      (c: DuelCard) => !c.faceDown,
    );
    if (faceUpLife.length < 1) return;

    anyEngine.decisions.pause(
      {
        id: `${event.sourceInstanceId}:st13-009:confirm`,
        effectId: 'st13-009-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message: '[Shanks] Turn 1 face-up Life card face-down?',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) return;

        anyEngine.decisions.chooseCards(
          `${event.sourceInstanceId}:st13-009:choose-life`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          'Choose 1 face-up Life card to turn face-down.',
          {
            player: 'self',
            zones: ['life'],
            filter: { rested: false },
            count: { kind: 'exact', value: 1 },
          },
          undefined,
          (selected: DuelCard[]) => {
            for (const card of selected) {
              card.faceDown = true;
            }
            host.addLog('[Shanks] Turned a face-up Life card face-down.');

            const opponentId = host.getOpponentSessionId(event.playerSessionId);
            if (!opponentId) return;
            const opponent = host.getPlayer(opponentId);
            if (!opponent || opponent.zones.hand.length < 7) return;
            if (opponent.zones.life.length < 1) return;

            anyEngine.decisions.pause(
              {
                id: `${event.sourceInstanceId}:st13-009:trash-life`,
                effectId: 'st13-009-special',
                effectCardId: event.sourceCardId,
                sourceInstanceId: event.sourceInstanceId,
                playerSessionId: event.playerSessionId,
                createdAt: new Date().toISOString(),
                prompt: {
                  type: 'confirm',
                  message:
                    "[Shanks] Opponent has 7+ cards in hand. Trash 1 from top of opponent's Life?",
                  optional: true,
                },
              },
              (trashResponse: { confirmed?: boolean }) => {
                if (!trashResponse.confirmed) return;

                const oppTopLife = opponent.zones.life[0];
                if (!oppTopLife) return;

                host.moveCard(oppTopLife, opponentId, 'trash');
                host.addLog(
                  "[Shanks] Trashed 1 card from top of opponent's Life.",
                );
                host.syncPlayer(opponentId);
              },
            );
          },
        );
      },
    );
  },
};
