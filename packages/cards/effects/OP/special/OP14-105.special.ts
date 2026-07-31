import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP14-105 Gorgon Sisters
 * [Activate: Main] [Once Per Turn] You may reveal 3 {Amazon Lily} or {Kuja
 * Pirates} type cards from your hand: Give your Leader and all of your
 * Characters up to 1 rested DON!! card each.
 * [Trigger] If your Leader has the {Kuja Pirates} type, play this card.
 */
export const op14105SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-105-special',
  cardId: 'OP14-105',
  resolve(event, engine) {
    if (event.type === 'activateMain') {
      const player = engine.getPlayer(event.playerSessionId);
      if (!player) return;

      engine.chooseCards(
        `${event.sourceInstanceId}:op14-105:reveal-hand`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        '[Gorgon Sisters] Reveal 3 {Amazon Lily} or {Kuja Pirates} cards from your hand:',
        {
          player: 'self',
          zones: ['hand'],
          filter: { trait: ['Amazon Lily', 'Kuja Pirates'] },
          count: { kind: 'exact', value: 3 },
        },
        undefined,
        (revealed) => {
          if (revealed.length < 3) return;

          const donDeck = engine.getCards(
            { player: 'self', zones: ['donDeck'] },
            event.playerSessionId,
          );
          const allTargets = [
            player.zones.leader,
            ...player.zones.characters,
          ].filter((c) => c.instanceId);
          const amount = Math.min(donDeck.length, allTargets.length);

          for (let i = 0; i < amount; i++) {
            engine.addDonToCost(event.playerSessionId, 1, true);
          }

          engine.syncPlayer(event.playerSessionId);
          engine.reapplyContinuousEffects();
        },
      );
    } else if (event.type === 'trigger') {
      const player = engine.getPlayer(event.playerSessionId);
      if (!player) return;
      const leader = player.zones.leader;
      if (!leader || !leader.families?.some((f: string) => f.includes('Kuja')))
        return;

      const source = engine.getCard(event.sourceInstanceId);
      if (!source) return;
      engine.playCard(source, event.playerSessionId, 'characters');
      engine.syncPlayer(event.playerSessionId);
      engine.reapplyContinuousEffects();
    }
  },
};
