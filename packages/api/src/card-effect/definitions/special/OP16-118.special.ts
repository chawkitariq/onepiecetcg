import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP16-118
 * [On Play] / [On K.O.] Look at 5 cards from the top of your deck;
 * reveal up to 1 [Monkey.D.Luffy] or up to 1 card with a type including
 * "Whitebeard Pirates" and add it to your hand. Then, place the rest at
 * the bottom of your deck in any order.
 *
 * The player first chooses which target to search for (Luffy by name or
 * Whitebeard Pirates by trait), then a `search` action handles the top-5
 * peek, optional pick, and bottom-deck return.
 *
 * NOTE: The continuous counter bonus (+2000 for 8000-power chars in hand)
 * is a ContinuousEffectDefinition; only the search is handled here.
 */
export const op16118SpecialHandler: SpecialHandlerDefinition = {
  id: 'op16-118-counter-mod-and-search',
  cardId: 'OP16-118',
  resolve(event, engine) {
    if (event.type !== 'onPlay' && event.type !== 'onKo') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;

    anyEngine.decisions.chooseChoice(
      `${event.sourceInstanceId}:op16-118:branch`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      'Search for which card?',
      [
        { id: 'luffy', label: 'Monkey.D.Luffy' },
        { id: 'whitebeard', label: 'Whitebeard Pirates' },
      ],
      1,
      1,
      (choiceIds) => {
        const filter =
          choiceIds[0] === 'luffy'
            ? { name: ['Monkey.D.Luffy'] }
            : { trait: ['Whitebeard Pirates'] };

        const definition: StandardEffectDefinition = {
          id: 'op16-118-search',
          text: 'Look at 5 cards; add up to 1 matching card to hand; rest to bottom.',
          trigger: { type: event.type },
          actions: [
            {
              type: 'search',
              player: 'self',
              sourceZone: 'deck',
              amount: 5,
              filter,
              count: { kind: 'upTo', value: 1 },
              destination: 'hand',
              restDestination: 'deck',
              restToBottom: true,
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
    );
  },
};
