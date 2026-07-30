/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

export const op08043SpecialHandler: SpecialHandlerDefinition = {
  id: 'op08-043-special',
  cardId: 'OP08-043',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;
    const leader = player.leader;
    if (
      !leader ||
      !leader.types?.some((t: string) => t.includes('Whitebeard Pirates'))
    )
      return;
    const life = host.getCards(
      { player: 'self', zones: ['life'] },
      event.playerSessionId,
    );
    if (life.length > 2) return;
    const opponentChars = host.getCards(
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'] },
      },
      event.playerSessionId,
    );
    if (!opponentChars.length) {
      engine.reapplyContinuousEffects();
      return;
    }
    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op08-043:select-all`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      'Select all opponent Characters to restrict:',
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'] },
        count: { kind: 'exact', value: opponentChars.length },
      },
      undefined,
      (selected) => {
        for (const card of selected) {
          anyEngine.modifiers.addKeywordModifier(
            event.sourceInstanceId,
            event.playerSessionId,
            card.instanceId,
            'cannotAttackUnlessPay2',
            'untilStartOfYourNextTurn',
          );
        }
        engine.reapplyContinuousEffects();
      },
    );
  },
};
