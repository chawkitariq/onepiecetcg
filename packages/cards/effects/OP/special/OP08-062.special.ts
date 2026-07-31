import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

export const op08062SpecialHandler: SpecialHandlerDefinition = {
  id: 'op08-062-special',
  cardId: 'OP08-062',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;
    const leader = player.leader;
    if (
      !leader ||
      !leader.types?.some((t: string) => t.includes('Big Mom Pirates'))
    )
      return;
    const opponentDon = host.getCards(
      { player: 'opponent', zones: ['cost'] },
      event.playerSessionId,
    );
    const costMax = opponentDon.length;
    host.moveCard(source, event.playerSessionId, 'trash');
    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op08-062:play-katakuri`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      `[Charlotte Katakuri] Choose up to 1 [Charlotte Katakuri] from your hand (cost 3-${costMax}) to play:`,
      {
        player: 'self',
        zones: ['hand'],
        filter: {
          name: ['Charlotte Katakuri'],
          costMin: 3,
          costMax: Math.max(3, costMax),
        },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (cards) => {
        for (const card of cards) {
          host.playCard(card, event.playerSessionId, 'characters');
        }
        engine.reapplyContinuousEffects();
      },
    );
  },
};
