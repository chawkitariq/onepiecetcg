import type { EditionEffectDefinitions } from '@onepiecetcg/shared';
import type {
  EffectSourceBundle,
  SpecialHandlerDefinition,
} from '@onepiecetcg/shared';
import { ebEditionEffectDefinitions, ebEditionSpecialHandlers } from './EB/index.js';
import { opEditionEffectDefinitions, opEditionSpecialHandlers } from './OP/index.js';
import { stEditionEffectDefinitions, stEditionSpecialHandlers } from './ST/index.js';

/** All authored edition effect definitions shipped with the cards package. */
export const effectDefinitionEditions: readonly EditionEffectDefinitions[] = [
  ...ebEditionEffectDefinitions,
  ...opEditionEffectDefinitions,
  ...stEditionEffectDefinitions,
] as const;

/** All authored special handlers shipped with the cards package. */
export const specialHandlerDefinitions: readonly SpecialHandlerDefinition[] = [
  ...ebEditionSpecialHandlers,
  ...opEditionSpecialHandlers,
  ...stEditionSpecialHandlers,
] as const;

/** Returns the complete authored effect bundle consumable by the engine. */
export function loadEffectSources(): EffectSourceBundle {
  return {
    definitions: effectDefinitionEditions,
    specialHandlers: specialHandlerDefinitions,
  };
}
