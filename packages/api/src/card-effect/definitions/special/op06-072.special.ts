import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op06072SpecialHandler: SpecialHandlerDefinition = {
  id: 'op06-072-special',
  cardId: 'OP06-072',
  resolve(event, engine) {
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    const source = host.getCard(event.sourceInstanceId);
    if (!player || !source) return;

    const leaderHasGerma = player.leader?.families?.includes('GERMA 66');
    const ownDon = host.getCards(
      { player: 'self', zones: ['don', 'cost'] },
      event.playerSessionId,
    ).length;
    const oppDon = host.getCards(
      { player: 'opponent', zones: ['don', 'cost'] },
      event.playerSessionId,
    ).length;

    if (leaderHasGerma && oppDon - ownDon >= 2) {
      if (!source.keywords?.includes('mustBeAttackTarget')) {
        source.keywords = [...(source.keywords ?? []), 'mustBeAttackTarget'];
        host.syncCard(source);
      }
    }
  },
};
