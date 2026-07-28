import type { ReplacementPrimitiveDefinition } from '../types/effect-definition-source';
import { cannotBeKoByEffectsReplacement } from './cannot-be-ko-by-effects.replacement';

export const replacementPrimitiveDefinitions: readonly ReplacementPrimitiveDefinition[] =
  [cannotBeKoByEffectsReplacement];
