import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

export const op08062SpecialHandler: SpecialHandlerDefinition = {
  id: 'op08-062-special',
  cardId: 'OP08-062',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const source = engine.getCard(event.sourceInstanceId);
    if (!source) return;
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;
    const leader = (player as any).leader;
    if (
      !leader ||
      !leader.types?.some((t: string) => t.includes('Big Mom Pirates'))
    )
      return;
    const opponentDon = engine.getCards(
      { player: 'opponent', zones: ['cost'] },
      event.playerSessionId,
    );
    const costMax = opponentDon.length;
    engine.moveCard(source, event.playerSessionId, 'trash');
    engine.chooseCards(
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
          engine.playCard(card, event.playerSessionId, 'characters');
        }
        engine.reapplyContinuousEffects();
      },
    );
  },
};
