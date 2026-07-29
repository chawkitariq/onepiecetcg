import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op06095SpecialHandler: SpecialHandlerDefinition = {
  id: 'op06-095-special',
  cardId: 'OP06-095',
  resolve(event, engine) {
    if (event.type !== 'activateMain' && event.type !== 'activateCounter')
      return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    if (!player?.leader) return;

    anyEngine.modifiers.addPowerModifier(
      event.sourceInstanceId,
      event.playerSessionId,
      player.leader.instanceId,
      1000,
      'untilEndOfTurn',
    );

    const thrillerChars = host.getCards(
      {
        player: 'self',
        zones: ['characters'],
        filter: {
          cardCategory: ['Character'],
          trait: ['Thriller Bark Pirates'],
          costMax: 2,
        },
      },
      event.playerSessionId,
    );

    if (thrillerChars.length === 0) {
      engine.reapplyContinuousEffects();
      return;
    }

    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op06-095:ko-thriller`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Shadows Asgard] K.O. any number of your Thriller Bark Pirates Characters (cost 2 or less) for extra power:',
      {
        player: 'self',
        zones: ['characters'],
        filter: {
          cardCategory: ['Character'],
          trait: ['Thriller Bark Pirates'],
          costMax: 2,
        },
      },
      { kind: 'any' },
      (koed) => {
        const count = koed.length;
        for (const card of koed) {
          host.moveCard(card, event.playerSessionId, 'trash');
        }
        if (count > 0 && player.leader) {
          anyEngine.modifiers.addPowerModifier(
            event.sourceInstanceId,
            event.playerSessionId,
            player.leader.instanceId,
            1000 * count,
            'untilEndOfTurn',
          );
        }
        engine.reapplyContinuousEffects();
      },
    );
  },
};
