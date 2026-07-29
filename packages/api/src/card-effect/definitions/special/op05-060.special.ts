import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * Handles Monkey.D.Luffy 060 because the DON!! condition depends on the
 * current total on-field DON!! count, and the effect has an optional life cost.
 */
export const op05060SpecialHandler: SpecialHandlerDefinition = {
  id: 'op05-060-special',
  cardId: 'OP05-060',
  resolve(event, engine) {
    if (event.type !== 'activateMain') {
      return;
    }

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);

    if (!player) {
      return;
    }

    const inPlayCards = [
      player.zones.leader,
      ...player.zones.characters,
      ...(player.zones.stage.instanceId ? [player.zones.stage] : []),
    ];
    const totalDon =
      player.zones.cost.length +
      inPlayCards.reduce(
        (sum: number, card: { attachedDon: number }) => sum + card.attachedDon,
        0,
      );

    const definition: StandardEffectDefinition = {
      id: 'monkey-d-luffy-060-activate-main-life-to-hand-add-don-if-0-or-3-more',
      text: '[Activate:Main] [Once Per Turn] You may add 1 card from the top of your Life cards to your hand: If you have 0 or 3 or more DON!! cards on your field, add up to 1 DON!! card from your DON!! deck and set it as active.',
      trigger: { type: 'activateMain', optional: true, oncePerTurn: true },
      costs: [
        {
          type: 'moveCard',
          selector: {
            player: 'self',
            zones: ['life'],
            filter: { zonePosition: 'top' },
            count: { kind: 'exact', value: 1 },
          },
          destinationPlayer: 'self',
          destinationZone: 'hand',
        },
      ],
      actions:
        totalDon === 0 || totalDon >= 3
          ? [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: false,
              },
            ]
          : [],
    };

    engine.queueEffect(
      event.playerSessionId,
      event.sourceInstanceId,
      event.sourceCardId,
      definition,
    );
  },
};
