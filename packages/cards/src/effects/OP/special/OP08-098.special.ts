import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

export const op08098SpecialHandler: SpecialHandlerDefinition = {
  id: 'op08-098-special',
  cardId: 'OP08-098',
  resolve(event, engine) {
    if (event.type !== 'whenAttacking') return;
    const source = engine.getCard(event.sourceInstanceId);
    if (!source) return;
    const attachedDon = engine.getCards(
      {
        player: 'self',
        zones: ['cost'],
        filter: { attachedTo: event.sourceInstanceId } as any,
      },
      event.playerSessionId,
    );
    if (attachedDon.length < 1) return;
    const fieldDon = engine.getCards(
      { player: 'self', zones: ['cost'] },
      event.playerSessionId,
    ).length;
    engine.chooseCards(
      `${event.sourceInstanceId}:op08-098:play-shandian`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      `[Kalgara] Choose up to 1 {Shandian Warrior} Character from your hand (cost ≤ ${fieldDon}) to play:`,
      {
        player: 'self',
        zones: ['hand'],
        filter: {
          cardCategory: ['Character'],
          trait: ['Shandian Warrior'],
          costMax: fieldDon,
        },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (selected) => {
        if (selected.length > 0) {
          for (const card of selected) {
            engine.playCard(card, event.playerSessionId, 'characters');
          }
          const lifeTop = engine.getCards(
            {
              player: 'self',
              zones: ['life'],
              count: { kind: 'exact', value: 1 },
            },
            event.playerSessionId,
          );
          if (lifeTop.length) {
            engine.moveCard(lifeTop[0], event.playerSessionId, 'hand');
          }
        }
        engine.reapplyContinuousEffects();
      },
    );
  },
};
