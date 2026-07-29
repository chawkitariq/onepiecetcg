import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * Handles Let Us Begin the World of Violence!! because both branches depend on
 * a multicolored leader, which the declarative DSL cannot check directly.
 */
export const op05059SpecialHandler: SpecialHandlerDefinition = {
  id: 'op05-059-special',
  cardId: 'OP05-059',
  resolve(event, engine) {
    if (event.type !== 'activateMain' && event.type !== 'trigger') {
      return;
    }

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    const leader = player?.zones.leader;

    if (!player || !leader || leader.colors.length < 2) {
      return;
    }

    const definition: StandardEffectDefinition =
      event.type === 'trigger'
        ? {
            id: 'let-us-begin-the-world-of-violence-059-trigger-draw-2',
            text: '[Trigger] If your Leader is multicolored, draw 2 cards.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          }
        : {
            id: 'let-us-begin-the-world-of-violence-059-main-draw-1-return-cost-5-or-less',
            text: "[Main] If your Leader is multicolored, draw 1 card. Then, return up to 1 Character with a cost of 5 or less to the owner's hand.",
            trigger: { type: 'activateMain' },
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
            ],
          };

    engine.queueEffect(
      event.playerSessionId,
      event.sourceInstanceId,
      event.sourceCardId,
      definition,
    );
  },
};
