import type { EditionEffectDefinitions } from '../../types/effect-definition-source';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';
import { eb01EffectDefinitions } from './EB-01.effects';
import { eb02EffectDefinitions } from './EB-02.effects';
import { eb03EffectDefinitions } from './EB-03.effects';
import { eb04EffectDefinitions } from './EB-04.effects';
import { ebSpecialHandlers } from './special';

export const ebEditionEffectDefinitions: readonly EditionEffectDefinitions[] = [
  eb01EffectDefinitions,
  eb02EffectDefinitions,
  eb03EffectDefinitions,
  eb04EffectDefinitions,
] as const;

export const ebEditionSpecialHandlers: readonly SpecialHandlerDefinition[] =
  ebSpecialHandlers;
