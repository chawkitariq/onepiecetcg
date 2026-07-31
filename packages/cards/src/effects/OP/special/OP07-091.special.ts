import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

export const op07091SpecialHandler: SpecialHandlerDefinition = {
  id: 'op07-091-special',
  cardId: 'OP07-091',
  resolve(event, engine) {
    if (event.type !== 'whenAttacking') return;
    const source = engine.getCard(event.sourceInstanceId);
    if (!source) return;
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;
    engine.chooseCards(
      `${event.sourceInstanceId}:op07-091:ko-target`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Monkey.D.Luffy] Choose up to 1 opponent Character (cost 2 or less) to trash:',
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], costMax: 2 },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (koTargets) => {
        for (const card of koTargets)
          engine.moveCard(card, event.playerSessionId, 'trash');
        engine.chooseCards(
          `${event.sourceInstanceId}:op07-091:bottom-cards`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          '[Monkey.D.Luffy] Choose any number of Character cards (cost 4+) from your trash to bottom of deck:',
          {
            player: 'self',
            zones: ['trash'],
            filter: { cardCategory: ['Character'], costMin: 4 },
          },
          { kind: 'any' },
          (selected) => {
            const count = selected.length;
            for (const card of selected)
              engine.moveCard(card, event.playerSessionId, 'deck', {
                toBottom: true,
              });
            if (count >= 3) {
              engine.addPowerModifier(
                event.sourceInstanceId,
                event.playerSessionId,
                source.instanceId,
                Math.floor(count / 3) * 1000,
                'untilEndOfTurn',
              );
            }
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
