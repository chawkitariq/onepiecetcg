import type { ReplacementPrimitiveDefinition } from '../types/effect-definition-source';

export const cannotBeKoByEffectsReplacement: ReplacementPrimitiveDefinition = {
  id: 'cannot-be-ko-by-effects',
  effect: {
    id: 'cannot-be-ko-by-effects',
    text: 'This Character cannot be KOd by effects.',
    event: 'wouldKoCharacter',
    replacement: [],
    priority: 0,
  },
};
