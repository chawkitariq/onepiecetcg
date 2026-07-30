import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op06083SpecialHandler: SpecialHandlerDefinition = {
  id: 'op06-083-special',
  cardId: 'OP06-083',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op06-083:ko-thriller`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Oars] Choose 1 of your Thriller Bark Pirates Characters to K.O.:',
      {
        player: 'self',
        zones: ['characters'],
        filter: {
          cardCategory: ['Character'],
          trait: ['Thriller Bark Pirates'],
        },
        count: { kind: 'exact', value: 1 },
      },
      undefined,
      (cards) => {
        for (const card of cards) {
          host.moveCard(card, event.playerSessionId, 'trash');
        }
        source.effectNegated = false;
        source.cannotAttack = false;
        host.syncCard(source);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
