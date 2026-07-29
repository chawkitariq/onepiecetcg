import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op04040SpecialHandler: SpecialHandlerDefinition = {
  id: 'op04-040-special',
  cardId: 'OP04-040',
  resolve(event, engine) {
    if (event.type !== 'whenAttacking') {
      return;
    }

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    const player = host.getPlayer(event.playerSessionId);

    if (!source || !player || source.attachedDon < 1) {
      return;
    }

    const totalLifeAndHand =
      player.zones.life.length + player.zones.hand.length;

    if (totalLifeAndHand > 4) {
      return;
    }

    const hasCost8OrMoreCharacter =
      host.getCards(
        {
          player: 'self',
          zones: ['characters'],
          filter: { cardCategory: ['Character'], costMin: 8 },
          count: { kind: 'upTo', value: 1 },
        },
        event.playerSessionId,
      ).length > 0;

    const canAddLife = hasCost8OrMoreCharacter && player.zones.deck.length > 0;

    const definition: StandardEffectDefinition = canAddLife
      ? {
          id: 'queen-040-special-choice-draw-or-add-life',
          text: 'If you have a Character with a cost of 8 or more, you may add up to 1 card from the top of your deck to the top of your Life cards instead of drawing 1 card.',
          trigger: { type: 'whenAttacking' },
          actions: [
            {
              type: 'chooseActionBranch',
              message:
                'Choisissez entre piocher 1 carte ou ajouter la carte du dessus du deck a la Vie.',
              choices: [
                {
                  id: 'draw-1',
                  label: 'Piocher 1',
                  actions: [{ type: 'draw', player: 'self', amount: 1 }],
                },
                {
                  id: 'add-top-deck-to-life',
                  label: 'Ajouter a la Vie',
                  actions: [
                    {
                      type: 'moveFirstCard',
                      selector: {
                        player: 'self',
                        zones: ['deck'],
                        filter: { zonePosition: 'top' },
                        count: { kind: 'exact', value: 1 },
                      },
                      destinationPlayer: 'selectedCardOwner',
                      destinationZone: 'life',
                    },
                  ],
                },
              ],
            },
          ],
        }
      : {
          id: 'queen-040-special-draw-1',
          text: '[DON!! x1] [When Attacking] If you have a total of 4 or less cards in your Life area and hand, draw 1 card.',
          trigger: { type: 'whenAttacking' },
          actions: [{ type: 'draw', player: 'self', amount: 1 }],
        };

    engine.queueEffect(
      event.playerSessionId,
      event.sourceInstanceId,
      event.sourceCardId,
      definition,
    );
  },
};
