/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * Koby Leader - handles the replacement effect.
 *
 * Continuous effect (SWORD characters can attack Characters on turn played)
 * is expected in the main definition's `continuous` section.
 *
 * Replacement: [Once Per Turn] If your "Navy" type Character with 7000 base
 * power or less would be removed from the field by your opponent's effect,
 * you may place 3 cards from your trash at the bottom of your deck instead.
 */
export const op11001SpecialHandler: SpecialHandlerDefinition = {
  id: 'op11-001-special',
  cardId: 'OP11-001',
  resolve(event, engine) {
    const anyEvt = event as any;
    if (anyEvt.type !== 'wouldKoCharacter' && anyEvt.type !== 'wouldMoveCard') {
      return;
    }

    const anyEngine = engine as any;
    const host = anyEngine.host;

    const oncePerTurnKey = `${anyEvt.sourceInstanceId}:op11-001:${host.state.turn}`;
    if (anyEngine.resolvedOncePerTurnKeys?.has(oncePerTurnKey)) {
      return;
    }

    const target = host.getCard(anyEvt.targetInstanceId);
    if (!target) return;

    const isNavy = target.families?.some((f: string) => f === 'Navy');
    if (!isNavy) return;

    const basePower = target.basePower ?? target.power ?? 0;
    if (basePower > 7000) return;

    if (anyEvt.reason !== 'effect') return;

    const trashCards = host.getCards(
      {
        player: 'self',
        zones: ['trash'],
        count: { kind: 'upTo', value: 3 },
      },
      anyEvt.playerSessionId,
    );
    if (trashCards.length < 3) return;

    anyEngine.decisions.pause(
      {
        id: `${anyEvt.sourceInstanceId}:op11-001:replace-ko`,
        effectId: 'op11-001-special',
        effectCardId: 'OP11-001',
        sourceInstanceId: anyEvt.sourceInstanceId,
        playerSessionId: anyEvt.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message:
            '[Koby] Place 3 cards from your trash at the bottom of your deck instead?',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) return;

        anyEngine.resolvedOncePerTurnKeys?.add(oncePerTurnKey);

        const selected = host.getCards(
          {
            player: 'self',
            zones: ['trash'],
            count: { kind: 'exact', value: 3 },
          },
          anyEvt.playerSessionId,
        );
        for (const card of selected) {
          host.moveCard(card, anyEvt.playerSessionId, 'deck', {
            toBottom: true,
          });
        }

        anyEngine.preventDefaultMove?.();
        engine.reapplyContinuousEffects();
      },
    );
  },
};
