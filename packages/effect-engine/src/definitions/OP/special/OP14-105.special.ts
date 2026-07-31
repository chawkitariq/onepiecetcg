/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

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
      const anyEngine = engine as any;
      const { host, decisions } = anyEngine;
      const player = host.getPlayer(event.playerSessionId);
      if (!player) return;

      decisions.chooseCards(
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

          const donDeck = host.getCards(
            { player: 'self', zones: ['donDeck'] },
            event.playerSessionId,
          );
          const allTargets = [
            player.zones.leader,
            ...player.zones.characters,
          ].filter((c) => c.instanceId);
          const amount = Math.min(donDeck.length, allTargets.length);

          for (let i = 0; i < amount; i++) {
            host.addDonToCost(event.playerSessionId, 1, true);
          }

          host.syncPlayer(event.playerSessionId);
          engine.reapplyContinuousEffects();
        },
      );
    } else if (event.type === 'trigger') {
      const anyEngine = engine as any;
      const { host } = anyEngine;
      const player = host.getPlayer(event.playerSessionId);
      if (!player) return;
      const leader = player.zones.leader;
      if (!leader || !leader.families?.some((f: string) => f.includes('Kuja')))
        return;

      const source = host.getCard(event.sourceInstanceId);
      if (!source) return;
      host.playCard(source, event.playerSessionId, 'characters');
      host.syncPlayer(event.playerSessionId);
      engine.reapplyContinuousEffects();
    }
  },
};
