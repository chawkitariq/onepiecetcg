import type { EditionEffectDefinitions } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { eb01EffectDefinitions } from './EB-01.effects.js';
import { eb02EffectDefinitions } from './EB-02.effects.js';
import { eb03EffectDefinitions } from './EB-03.effects.js';
import { eb04EffectDefinitions } from './EB-04.effects.js';
import { ebSpecialHandlers } from './special/index.js';

export const ebEditionEffectDefinitions: readonly EditionEffectDefinitions[] = [
  eb01EffectDefinitions,
  eb02EffectDefinitions,
  eb03EffectDefinitions,
  eb04EffectDefinitions,
] as const;

export const ebEditionSpecialHandlers: readonly SpecialHandlerDefinition[] =
  ebSpecialHandlers;
