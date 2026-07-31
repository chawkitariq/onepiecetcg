import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

/**
 * Handles Fire Fist because the KO target depends on the power reduction that
 * happens earlier in the same resolution, so the two steps must be sequenced
 * explicitly.
 */
export const op05019SpecialHandler: SpecialHandlerDefinition = {
  id: 'op05-019-special',
  cardId: 'OP05-019',
  resolve(event, engine) {
    if (event.type !== 'activateMain' && event.type !== 'trigger') {
      return;
    }

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    const opponentId = host.getOpponentSessionId(event.playerSessionId);
    const opponent = opponentId ? host.getPlayer(opponentId) : undefined;

    if (!player || !opponent) {
      return;
    }

    const source = host.getCard(event.sourceInstanceId);

    if (!source) {
      return;
    }

    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op05-019:minus-4000`,
      event.playerSessionId,
      {
        sourceInstanceId: event.sourceInstanceId,
        storedSelections: {},
      },
      event.playerSessionId,
      "[Fire Fist] Choisissez jusqu'a 1 Character adverse a qui retirer 4000 puissance.",
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'] },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (cards) => {
        const target = cards[0];

        if (target) {
          anyEngine.modifiers.addPowerModifier(
            event.sourceInstanceId,
            event.playerSessionId,
            target.instanceId,
            -4000,
            'untilEndOfTurn',
          );
          engine.reapplyContinuousEffects();
        }

        if (player.zones.life.length > 2) {
          return;
        }

        const koCandidates = host.getCards(
          {
            player: 'opponent',
            zones: ['characters'],
            filter: { cardCategory: ['Character'], powerMax: 0 },
            count: { kind: 'upTo', value: 1 },
          },
          event.playerSessionId,
        );

        if (koCandidates.length === 0) {
          return;
        }

        anyEngine.decisions.chooseCards(
          `${event.sourceInstanceId}:op05-019:ko-zero-power`,
          event.playerSessionId,
          {
            sourceInstanceId: event.sourceInstanceId,
            storedSelections: {},
          },
          event.playerSessionId,
          "[Fire Fist] Choisissez jusqu'a 1 Character adverse de puissance 0 ou moins a K.O.",
          {
            player: 'opponent',
            zones: ['characters'],
            filter: { cardCategory: ['Character'], powerMax: 0 },
            count: { kind: 'upTo', value: 1 },
          },
          undefined,
          (koCards) => {
            for (const koCard of koCards) {
              host.koCharacter(
                koCard.ownerSessionId,
                koCard.instanceId,
                'effect',
              );
            }
          },
        );
      },
    );
  },
};
