/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { DuelCard } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';
import {
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
} from '../../special-handler-utils';

/**
 * Monkey.D.Luffy (ST13-003) Leader special handler.
 *
 * Your face-up Life cards are placed at the bottom of your deck instead of
 * being added to your hand, according to the rules.
 *
 * [DON!! x2][Activate: Main][Once Per Turn] You may trash 1 card from your
 * hand: If you have 0 Life cards, add up to 2 Character cards with a cost of
 * 5 from your hand or trash to the top of your Life cards face-up.
 */
export const st13003SpecialHandler: SpecialHandlerDefinition = {
  id: 'st13-003-special',
  cardId: 'ST13-003',
  resolve(event, engine) {
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    if (event.type === 'onTurnStart') {
      anyEngine.modifiers.addPlayerRestriction(
        event.playerSessionId,
        'preventOwnEffectLifeToHand',
        'untilStartOfYourNextTurn',
      );
      return;
    }

    if (event.type === 'activateMain') {
      if (source.attachedDon < 2) return;
      if (
        hasResolvedOncePerTurn(
          anyEngine,
          event.sourceInstanceId,
          'st13-003-main',
          host.state.turn,
        )
      )
        return;

      const player = host.getPlayer(event.playerSessionId);
      if (!player || player.zones.hand.length < 1) return;

      anyEngine.decisions.pause(
        {
          id: `${event.sourceInstanceId}:st13-003:confirm`,
          effectId: 'st13-003-special',
          effectCardId: event.sourceCardId,
          sourceInstanceId: event.sourceInstanceId,
          playerSessionId: event.playerSessionId,
          createdAt: new Date().toISOString(),
          prompt: {
            type: 'confirm',
            message:
              '[Monkey.D.Luffy Leader] Trash 1 card from hand to add up to 2 Characters (cost 5) to Life?',
            optional: true,
          },
        },
        (response: { confirmed?: boolean }) => {
          if (!response.confirmed) return;

          markResolvedOncePerTurn(
            anyEngine,
            event.sourceInstanceId,
            'st13-003-main',
            host.state.turn,
          );

          anyEngine.decisions.chooseCards(
            `${event.sourceInstanceId}:st13-003:trash`,
            event.playerSessionId,
            { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
            event.playerSessionId,
            'Choose 1 card from hand to trash.',
            {
              player: 'self',
              zones: ['hand'],
              count: { kind: 'exact', value: 1 },
            },
            undefined,
            (trashed: DuelCard[]) => {
              for (const card of trashed) {
                host.moveCard(card, event.playerSessionId, 'trash');
              }

              if (player.zones.life.length > 0) return;

              const candidates = host.getCards(
                {
                  player: 'self',
                  zones: ['hand', 'trash'],
                  filter: {
                    cardCategory: ['Character'],
                    costMin: 5,
                    costMax: 5,
                  },
                  count: { kind: 'upTo', value: 2 },
                },
                event.playerSessionId,
              );
              if (candidates.length === 0) return;

              anyEngine.decisions.chooseCards(
                `${event.sourceInstanceId}:st13-003:pick`,
                event.playerSessionId,
                {
                  sourceInstanceId: event.sourceInstanceId,
                  storedSelections: {},
                },
                event.playerSessionId,
                'Choose up to 2 Character cards (cost 5) from hand or trash to add to Life face-up.',
                {
                  player: 'self',
                  zones: ['hand', 'trash'],
                  filter: {
                    cardCategory: ['Character'],
                    costMin: 5,
                    costMax: 5,
                  },
                  count: { kind: 'upTo', value: 2 },
                },
                undefined,
                (selected: DuelCard[]) => {
                  for (const card of selected) {
                    host.moveCard(card, event.playerSessionId, 'life', {
                      faceDown: false,
                    });
                  }
                  host.addLog(
                    `[Monkey.D.Luffy Leader] Added ${selected.length} card(s) to Life face-up.`,
                  );
                  host.syncPlayer(event.playerSessionId);
                },
              );
            },
          );
        },
      );
    }
  },
};
