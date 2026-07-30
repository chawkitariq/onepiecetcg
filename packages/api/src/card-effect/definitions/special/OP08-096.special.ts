import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op08096SpecialHandler: SpecialHandlerDefinition = {
  id: 'op08-096-special',
  cardId: 'OP08-096',
  resolve(event, engine) {
    if (event.type === 'activateCounter') {
      const anyEngine = engine as any;
      const host = anyEngine.host;
      const deckTop = host.getCards(
        { player: 'self', zones: ['deck'], count: { kind: 'exact', value: 1 } },
        event.playerSessionId,
      );
      if (!deckTop.length) {
        engine.reapplyContinuousEffects();
        return;
      }
      const trashed = deckTop[0];
      const cost = trashed.baseCost || 0;
      host.moveCard(trashed, event.playerSessionId, 'trash');
      if (cost >= 6) {
        anyEngine.decisions.chooseCards(
          `${event.sourceInstanceId}:op08-096:power-boost`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          "[People's Dreams] Choose up to 1 of your Leader or Character cards to gain +5000 power:",
          {
            player: 'self',
            zones: ['leader', 'characters'],
            count: { kind: 'upTo', value: 1 },
          },
          undefined,
          (selected) => {
            for (const card of selected) {
              anyEngine.modifiers.addPowerModifier(
                event.sourceInstanceId,
                event.playerSessionId,
                card.instanceId,
                5000,
                'untilEndOfBattle',
              );
            }
            engine.reapplyContinuousEffects();
          },
        );
      } else {
        engine.reapplyContinuousEffects();
      }
    } else if (event.type === 'trigger') {
      const anyEngine = engine as any;
      const host = anyEngine.host;
      anyEngine.decisions.chooseCards(
        `${event.sourceInstanceId}:op08-096:play-from-trash`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        "[People's Dreams] Choose up to 1 black Character (cost 3 or less) from your trash to play:",
        {
          player: 'self',
          zones: ['trash'],
          filter: {
            cardCategory: ['Character'],
            colors: ['Black'],
            costMax: 3,
          },
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        (selected) => {
          for (const card of selected) {
            host.playCard(card, event.playerSessionId, 'characters');
          }
          engine.reapplyContinuousEffects();
        },
      );
    }
  },
};
