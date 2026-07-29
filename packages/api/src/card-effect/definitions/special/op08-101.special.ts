import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op08101SpecialHandler: SpecialHandlerDefinition = {
  id: 'op08-101-special',
  cardId: 'OP08-101',
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
    const lifeTop = host.getCards(
      { player: 'self', zones: ['life'], count: { kind: 'exact', value: 1 } },
      event.playerSessionId,
    );
    if (!lifeTop.length) {
      engine.reapplyContinuousEffects();
      return;
    }
    host.moveCard(lifeTop[0], event.playerSessionId, 'trash');
    anyEngine.delayedEffects.push({
      trigger: { type: 'onTurnEnd' },
      sourceInstanceId: event.sourceInstanceId,
      resolve: () => {
        const deckTop = host.getCards(
          {
            player: 'self',
            zones: ['deck'],
            count: { kind: 'exact', value: 1 },
          },
          event.playerSessionId,
        );
        if (deckTop.length) {
          host.moveCard(deckTop[0], event.playerSessionId, 'life');
        }
        engine.reapplyContinuousEffects();
      },
    });
    engine.reapplyContinuousEffects();
  },
};
