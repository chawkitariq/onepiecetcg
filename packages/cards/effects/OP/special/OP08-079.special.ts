import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

export const op08079SpecialHandler: SpecialHandlerDefinition = {
  id: 'op08-079-special',
  cardId: 'OP08-079',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;
    const playedOnTurn = source.playedOnTurn === host.state.turn;
    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op08-079:trash-hand`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Kaido] You may trash 1 card from your hand:',
      { player: 'self', zones: ['hand'], count: { kind: 'upTo', value: 1 } },
      undefined,
      (trashed) => {
        for (const card of trashed) {
          host.moveCard(card, event.playerSessionId, 'trash');
        }
        if (playedOnTurn && trashed.length > 0) {
          anyEngine.decisions.chooseCards(
            `${event.sourceInstanceId}:op08-079:ko-target`,
            event.playerSessionId,
            { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
            event.playerSessionId,
            '[Kaido] Choose up to 1 opponent Character (cost 7 or less) to trash:',
            {
              player: 'opponent',
              zones: ['characters'],
              filter: { cardCategory: ['Character'], costMax: 7 },
              count: { kind: 'upTo', value: 1 },
            },
            undefined,
            (koTargets) => {
              for (const card of koTargets) {
                host.moveCard(card, card.ownerSessionId, 'trash');
              }
              anyEngine.decisions.chooseCards(
                `${event.sourceInstanceId}:op08-079:opponent-trash`,
                event.playerSessionId,
                {
                  sourceInstanceId: event.sourceInstanceId,
                  storedSelections: {},
                },
                host.getOpponentSessionId(event.playerSessionId),
                '[Kaido] Trash 1 card from your hand:',
                {
                  player: 'opponent',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
                undefined,
                (opponentCards) => {
                  for (const card of opponentCards) {
                    host.moveCard(card, card.ownerSessionId, 'trash');
                  }
                  engine.reapplyContinuousEffects();
                },
              );
            },
          );
        } else {
          engine.reapplyContinuousEffects();
        }
      },
    );
  },
};
