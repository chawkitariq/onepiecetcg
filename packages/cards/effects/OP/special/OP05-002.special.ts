import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * Handles Belo Betty because the effect has an optional activation cost and
 * the target pool mixes two selector shapes that the current DSL cannot union.
 */
export const op05002SpecialHandler: SpecialHandlerDefinition = {
  id: 'op05-002-special',
  cardId: 'OP05-002',
  resolve(event, engine) {
    if (event.type !== 'activateMain') {
      return;
    }

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);

    if (!player) {
      return;
    }

    const handCostCards = host.getCards(
      {
        player: 'self',
        zones: ['hand'],
        filter: { trait: ['Revolutionary Army'] },
        count: { kind: 'upTo', value: 1 },
      },
      event.playerSessionId,
    );

    if (handCostCards.length === 0) {
      return;
    }

    const oncePerTurnKey = `${event.sourceInstanceId}:op05-002:${host.state.turn}`;

    if (anyEngine.resolvedOncePerTurnKeys?.has(oncePerTurnKey)) {
      return;
    }

    anyEngine.decisions.pause(
      {
        id: `${event.sourceInstanceId}:op05-002:confirm`,
        effectId: 'op05-002-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message: '[Belo Betty] Voulez-vous activer cet effet ?',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) {
          return;
        }

        anyEngine.decisions.chooseCards(
          `${event.sourceInstanceId}:op05-002:trash-1`,
          event.playerSessionId,
          {
            sourceInstanceId: event.sourceInstanceId,
            storedSelections: {},
          },
          event.playerSessionId,
          "[Belo Betty] Choisissez 1 carte 'Revolutionary Army' de votre main a defausser.",
          {
            player: 'self',
            zones: ['hand'],
            filter: { trait: ['Revolutionary Army'] },
            count: { kind: 'exact', value: 1 },
          },
          undefined,
          (cards) => {
            const costCard = cards[0];

            if (!costCard) {
              return;
            }

            host.moveCard(costCard, event.playerSessionId, 'trash');
            anyEngine.resolvedOncePerTurnKeys.add(oncePerTurnKey);

            const selectableTargets = host.getCards(
              {
                player: 'self',
                zones: ['characters'],
                filter: { cardCategory: ['Character'] },
                count: { kind: 'upTo', value: 3 },
              },
              event.playerSessionId,
            );

            if (selectableTargets.length === 0) {
              return;
            }

            anyEngine.decisions.chooseCards(
              `${event.sourceInstanceId}:op05-002:buff-up-to-3`,
              event.playerSessionId,
              {
                sourceInstanceId: event.sourceInstanceId,
                storedSelections: {},
              },
              event.playerSessionId,
              "[Belo Betty] Choisissez jusqu'a 3 Characters a qui donner +3000 puissance.",
              {
                player: 'self',
                zones: ['characters'],
                filter: { cardCategory: ['Character'] },
                count: { kind: 'upTo', value: 3 },
              },
              undefined,
              (selectedCards) => {
                for (const target of selectedCards) {
                  if (
                    !target.families.includes('Revolutionary Army') &&
                    (target.trigger?.length ?? 0) === 0
                  ) {
                    continue;
                  }

                  anyEngine.modifiers.addPowerModifier(
                    event.sourceInstanceId,
                    event.playerSessionId,
                    target.instanceId,
                    3000,
                    'untilEndOfTurn',
                  );
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
