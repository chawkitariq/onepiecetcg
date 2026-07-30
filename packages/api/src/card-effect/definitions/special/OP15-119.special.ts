import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP15-119 "Monkey.D.Luffy (OP15-119)"
 * If you have 6 or more DON!! cards on your field, this Character gains [Rush].
 * When your opponent activates an Event or [Blocker], reveal up to 1 card from
 * the top of your Life cards. This Character gains +1000 power during this turn
 * per 1 cost on the revealed card.
 */
export const op15119SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-119-special',
  cardId: 'OP15-119',
  resolve(event, engine) {
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    // When opponent activates Event or Blocker
    if (event.type !== 'onEventActivated' && event.type !== 'onBlock') return;

    // Only trigger for opponent's activations
    const controllerId = source.ownerSessionId;
    if (event.playerSessionId === controllerId) return;

    const decisions = anyEngine.decisions;
    const player = host.getPlayer(controllerId);
    if (!player || player.zones.life.length === 0) return;

    decisions.pause(
      {
        id: `${event.sourceInstanceId}:op15-119:reveal-life`,
        effectId: 'op15-119-reveal-life',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: controllerId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message: '[Monkey.D.Luffy] Reveal top Life card for power bonus?',
          optional: true,
        },
      },
      (response) => {
        if (!response.confirmed) return;

        const lifeCards = host.getCards(
          {
            player: 'self',
            zones: ['life'],
            filter: { zonePosition: 'top' },
            count: { kind: 'exact', value: 1 },
          },
          controllerId,
        );

        const revealed = lifeCards[0];
        if (!revealed) return;

        const revealedCost = revealed.cost > 0 ? revealed.cost : 0;
        const powerBonus = revealedCost * 1000;

        anyEngine.modifiers.addPowerModifier(
          event.sourceInstanceId,
          controllerId,
          event.sourceInstanceId,
          powerBonus,
          'untilEndOfTurn',
        );

        host.addLog(
          `Revealed ${revealed.name} (cost ${revealedCost}), ${source.name} gains +${powerBonus} power`,
        );

        host.syncPlayer(controllerId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
