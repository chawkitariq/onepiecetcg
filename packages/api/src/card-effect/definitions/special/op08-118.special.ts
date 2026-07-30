import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op08118SpecialHandler: SpecialHandlerDefinition = {
  id: 'op08-118-special',
  cardId: 'OP08-118',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;
    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op08-118:select-two`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Silvers Rayleigh] Select up to 2 opponent Characters (first gets -3000 power, second gets -2000 power):',
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'] },
        count: { kind: 'upTo', value: 2 },
      },
      undefined,
      (selected) => {
        for (let i = 0; i < selected.length; i++) {
          const amount = i === 0 ? -3000 : -2000;
          anyEngine.modifiers.addPowerModifier(
            event.sourceInstanceId,
            event.playerSessionId,
            selected[i].instanceId,
            amount,
            'untilStartOfYourNextTurn',
          );
        }
        anyEngine.decisions.chooseCards(
          `${event.sourceInstanceId}:op08-118:ko-target`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          '[Silvers Rayleigh] Choose up to 1 opponent Character (3000 power or less) to K.O.:',
          {
            player: 'opponent',
            zones: ['characters'],
            filter: { cardCategory: ['Character'], powerMax: 3000 },
            count: { kind: 'upTo', value: 1 },
          },
          undefined,
          (koTargets) => {
            for (const card of koTargets) {
              host.moveCard(card, card.ownerSessionId, 'trash');
            }
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
