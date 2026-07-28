import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const op05EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'OP05',
  cards: [
    {
      cardId: 'OP05-051',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'borsalino-cannot-be-ko-by-effects',
            text: "This Character can't be KO'd by your opponent's effects.",
            event: 'wouldKoCharacter',
            replacement: [],
          },
        },
      ],
    },
  ],
};
