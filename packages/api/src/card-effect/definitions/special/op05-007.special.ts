import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * Handles Sabo 007 because the KO cap depends on the sum of selected targets'
 * power, which the declarative DSL cannot validate atomically.
 */
export const op05007SpecialHandler: SpecialHandlerDefinition = {
  id: 'op05-007-special',
  cardId: 'OP05-007',
  resolve(event, engine) {
    if (event.type !== 'onPlay') {
      return;
    }

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const player = host.getPlayer(event.playerSessionId);

    if (!player) {
      return;
    }

    decisions.chooseCards(
      `${event.sourceInstanceId}:op05-007`,
      event.playerSessionId,
      {
        sourceInstanceId: event.sourceInstanceId,
        storedSelections: {},
      },
      event.playerSessionId,
      "Choisissez jusqu'a 2 Characters de l'adversaire a K.O.",
      {
        player: 'opponent',
        zones: ['characters'],
        count: { kind: 'upTo', value: 2 },
      },
      undefined,
      (cards) => {
        const totalPower = cards.reduce((sum: number, card: { power: number }) => sum + card.power, 0);

        if (totalPower > 4000) {
          return;
        }

        for (const card of cards) {
          host.koCharacter(card.ownerSessionId, card.instanceId, 'effect');
        }
      },
    );
  },
};
