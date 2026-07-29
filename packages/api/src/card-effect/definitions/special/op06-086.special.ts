import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op06086SpecialHandler: SpecialHandlerDefinition = {
  id: 'op06-086-special',
  cardId: 'OP06-086',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;

    const trashCost4 = host.getCards(
      {
        player: 'self',
        zones: ['trash'],
        filter: { cardCategory: ['Character'], costMax: 4 },
        count: { kind: 'upTo', value: 1 },
      },
      event.playerSessionId,
    );
    const trashCost2 = host.getCards(
      {
        player: 'self',
        zones: ['trash'],
        filter: { cardCategory: ['Character'], costMax: 2 },
        count: { kind: 'upTo', value: 1 },
      },
      event.playerSessionId,
    );

    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op06-086:cost-4`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Gecko Moria] Choose up to 1 Character with cost 4 or less to play active:',
      {
        player: 'self',
        zones: ['trash'],
        filter: { cardCategory: ['Character'], costMax: 4 },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (activeCards) => {
        for (const card of activeCards) {
          host.playCard(card, event.playerSessionId, 'characters');
        }

        anyEngine.decisions.chooseCards(
          `${event.sourceInstanceId}:op06-086:cost-2`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          '[Gecko Moria] Choose up to 1 Character with cost 2 or less to play rested:',
          {
            player: 'self',
            zones: ['trash'],
            filter: { cardCategory: ['Character'], costMax: 2 },
            count: { kind: 'upTo', value: 1 },
          },
          undefined,
          (restedCards) => {
            for (const card of restedCards) {
              host.playCard(card, event.playerSessionId, 'characters', {
                rested: true,
              });
            }
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
