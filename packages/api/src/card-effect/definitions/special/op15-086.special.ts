import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP15-086 "Nami (OP15-086)"
 * [On Play] If your Leader has the {Straw Hat Crew} type, play up to 1
 * {Straw Hat Crew} type Character with a cost of 7 or less from your trash.
 * The Character played with this effect gains [Rush] during this turn.
 */
export const op15086SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-086-special',
  cardId: 'OP15-086',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    const leaderHasStrawHat = (player.zones.leader.families ?? []).includes(
      'Straw Hat Crew',
    );
    if (!leaderHasStrawHat) return;

    decisions.chooseCards(
      `${event.sourceInstanceId}:op15-086:play-from-trash`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Nami] Play up to 1 {Straw Hat Crew} Character (cost 7 or less) from your trash:',
      {
        player: 'self',
        zones: ['trash'],
        filter: {
          cardCategory: ['Character'],
          costMax: 7,
          trait: ['Straw Hat Crew'],
        },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (cards) => {
        for (const card of cards) {
          host.moveCard(card, event.playerSessionId, 'characters');
          card.playedThisTurn = true;
          card.hasRush = true;
        }
        host.syncPlayer(event.playerSessionId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
