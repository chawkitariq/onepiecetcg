/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP14-044 Edward.Newgate
 * [Blocker]
 * [On Play] Reveal 1 card from the top of your deck. If that card's type
 * includes "Whitebeard Pirates", draw 2 cards and trash 1 card from your hand.
 */
export const op14044SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-044-special',
  cardId: 'OP14-044',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;
    const anyEngine = engine as any;
    const { host, decisions } = anyEngine;

    const deckTop = host.getCards(
      { player: 'self', zones: ['deck'], count: { kind: 'exact', value: 1 } },
      event.playerSessionId,
    );
    if (!deckTop.length) return;
    const revealed = deckTop[0];

    const hasWhitebeard = (revealed.families || []).some((f: string) =>
      f.includes('Whitebeard'),
    );
    if (!hasWhitebeard) return;

    host.drawCard(event.playerSessionId);
    host.drawCard(event.playerSessionId);

    decisions.chooseCards(
      `${event.sourceInstanceId}:op14-044:trash-hand`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Edward.Newgate] Trash 1 card from your hand:',
      {
        player: 'self',
        zones: ['hand'],
        count: { kind: 'exact', value: 1 },
      },
      undefined,
      (trashed) => {
        for (const card of trashed) {
          host.moveCard(card, event.playerSessionId, 'trash');
        }
        host.syncPlayer(event.playerSessionId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
