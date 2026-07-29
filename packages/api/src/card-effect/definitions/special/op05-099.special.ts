import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * Handles Amazon because the opponent chooses whether to trash Life before
 * the fallback power reduction resolves.
 */
export const op05099SpecialHandler: SpecialHandlerDefinition = {
  id: 'op05-099-special',
  cardId: 'OP05-099',
  resolve(event, engine) {
    if (event.type !== 'onAttacked') {
      return;
    }

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    const opponentId = host.getOpponentSessionId(event.playerSessionId);
    const opponent = opponentId ? host.getPlayer(opponentId) : undefined;
    const source = host.getCard(event.sourceInstanceId);

    if (!player || !opponent || !source) {
      return;
    }

    anyEngine.decisions.pause(
      {
        id: `${event.sourceInstanceId}:op05-099:confirm-rest`,
        effectId: 'op05-099-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message: '[Amazon] Voulez-vous reposer cette carte ?',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) {
          return;
        }

        source.rested = true;

        if (opponent.zones.life.length > 0) {
          anyEngine.decisions.chooseChoices(
            `${event.sourceInstanceId}:op05-099:opponent-life`,
            opponent.sessionId,
            '[Amazon] Votre adversaire peut defausser 1 carte du dessus de sa Vie.',
            [
              { id: 'trash-life', label: 'Defausser la Vie' },
              { id: 'no-trash', label: 'Ne pas defausser' },
            ],
            1,
            1,
            (choiceIds) => {
              if (choiceIds.includes('trash-life')) {
                const lifeCard = opponent.zones.life[0];

                if (lifeCard) {
                  host.moveCard(lifeCard, opponent.sessionId, 'trash');
                }
                return;
              }

              anyEngine.decisions.chooseCards(
                `${event.sourceInstanceId}:op05-099:power-reduction`,
                event.playerSessionId,
                {
                  sourceInstanceId: event.sourceInstanceId,
                  storedSelections: {},
                },
                event.playerSessionId,
                "[Amazon] Choisissez jusqu'a 1 Leader ou Character adverse a qui retirer 2000 puissance.",
                {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  filter: { cardCategory: ['Leader', 'Character'] },
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
                      -2000,
                      'untilEndOfBattle',
                    );
                    engine.reapplyContinuousEffects();
                  }
                },
              );
            },
          );
          return;
        }

        anyEngine.decisions.chooseCards(
          `${event.sourceInstanceId}:op05-099:power-reduction`,
          event.playerSessionId,
          {
            sourceInstanceId: event.sourceInstanceId,
            storedSelections: {},
          },
          event.playerSessionId,
          "[Amazon] Choisissez jusqu'a 1 Leader ou Character adverse a qui retirer 2000 puissance.",
          {
            player: 'opponent',
            zones: ['leader', 'characters'],
            filter: { cardCategory: ['Leader', 'Character'] },
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
                -2000,
                'untilEndOfBattle',
              );
              engine.reapplyContinuousEffects();
            }
          },
        );
      },
    );
  },
};
