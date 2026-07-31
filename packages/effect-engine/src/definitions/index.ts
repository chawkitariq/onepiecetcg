import type { EditionEffectDefinitions } from '../types/effect-definition-source';
import type { SpecialHandlerDefinition } from '../types/effect-registry';
import { ebEditionEffectDefinitions, ebEditionSpecialHandlers } from './EB';
import { opEditionEffectDefinitions, opEditionSpecialHandlers } from './OP';
import { stEditionEffectDefinitions, stEditionSpecialHandlers } from './ST';

export const effectDefinitionEditions: readonly EditionEffectDefinitions[] = [
  ...ebEditionEffectDefinitions,
  ...opEditionEffectDefinitions,
  ...stEditionEffectDefinitions,
] as const;

export const specialHandlerDefinitions: readonly SpecialHandlerDefinition[] = [
  ...ebEditionSpecialHandlers,
  ...opEditionSpecialHandlers,
  ...stEditionSpecialHandlers,
] as const;
