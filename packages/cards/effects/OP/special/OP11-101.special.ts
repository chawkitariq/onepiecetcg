/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * Capone "Gang" Bege handler.
 *
 * [Blocker] (handled structurally by the duel room)
 *
 * [Once Per Turn] If your "Supernovas" type Character other than
 * [Capone"Gang"Bege] would be removed from the field by your opponent's
 * effect, you may add it to the top of your Life cards face-down instead.
 */
export const op11101SpecialHandler: SpecialHandlerDefinition = {
  id: 'op11-101-special',
  cardId: 'OP11-101',
  resolve(event, engine) {
    const anyEvt = event as any;
    if (anyEvt.type !== 'wouldKoCharacter' && anyEvt.type !== 'wouldMoveCard') {
      return;
    }

    const anyEngine = engine as any;
    const host = anyEngine.host;

    const oncePerTurnKey = `${anyEvt.sourceInstanceId}:op11-101:${host.state.turn}`;
    if (anyEngine.resolvedOncePerTurnKeys?.has(oncePerTurnKey)) return;

    const target = host.getCard(anyEvt.targetInstanceId);
    if (!target) return;

    const isSupernovas = target.families?.some(
      (f: string) => f === 'Supernovas',
    );
    if (!isSupernovas) return;

    if (target.name?.includes('Capone') || target.name?.includes('Bege')) {
      return;
    }

    if (anyEvt.reason !== 'effect') return;

    const player = host.getPlayer(anyEvt.playerSessionId);
    if (!player) return;

    anyEngine.decisions.pause(
      {
        id: `${anyEvt.sourceInstanceId}:op11-101:replace`,
        effectId: 'op11-101-special',
        effectCardId: 'OP11-101',
        sourceInstanceId: anyEvt.sourceInstanceId,
        playerSessionId: anyEvt.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message:
            '[Capone Bege] Add this Supernovas character to the top of Life face-down instead?',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) return;

        anyEngine.resolvedOncePerTurnKeys?.add(oncePerTurnKey);

        host.moveCard(target, anyEvt.playerSessionId, 'life', {
          faceDown: true,
          toBottom: false,
        });

        anyEngine.preventDefaultMove?.();
        engine.reapplyContinuousEffects();
      },
    );
  },
};
