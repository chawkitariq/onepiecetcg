import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

export const op07097SpecialHandler: SpecialHandlerDefinition = {
  id: 'op07-097-special',
  cardId: 'OP07-097',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const source = engine.getCard(event.sourceInstanceId);
    if (!source) return;
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;
    const don = engine.getCards(
      { player: 'self', zones: ['cost'] },
      event.playerSessionId,
    );
    if (don.length < 1) return;
    engine.patchCardStatus(don[0].instanceId, { rested: true });
    engine.chooseCards(
      `${event.sourceInstanceId}:op07-097:select-card`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Vegapunk] Choose up to 1 Egghead card (cost 5 or less) from your hand:',
      {
        player: 'self',
        zones: ['hand'],
        filter: { trait: ['Egghead'], costMax: 5 },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (selected) => {
        if (!selected.length) {
          engine.reapplyContinuousEffects();
          return;
        }
        const card = selected[0];
        engine.chooseChoices(
          `${event.sourceInstanceId}:op07-097:destination`,
          event.playerSessionId,
          'Play or add to top of Life?',
          [
            { id: 'play', label: 'Play' },
            { id: 'life', label: 'Add to Life face-up' },
          ],
          1,
          1,
          (choiceIds) => {
            if (choiceIds[0] === 'play')
              engine.playCard(card, event.playerSessionId, 'characters');
            else engine.moveCard(card, event.playerSessionId, 'life');
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
