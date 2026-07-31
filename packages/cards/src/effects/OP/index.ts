import type { EditionEffectDefinitions } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { op01EffectDefinitions } from './OP-01.effects.js';
import { op02EffectDefinitions } from './OP-02.effects.js';
import { op03EffectDefinitions } from './OP-03.effects.js';
import { op04EffectDefinitions } from './OP-04.effects.js';
import { op05EffectDefinitions } from './OP-05.effects.js';
import { op06EffectDefinitions } from './OP-06.effects.js';
import { op07EffectDefinitions } from './OP-07.effects.js';
import { op08EffectDefinitions } from './OP-08.effects.js';
import { op09EffectDefinitions } from './OP-09.effects.js';
import { op10EffectDefinitions } from './OP-10.effects.js';
import { op11EffectDefinitions } from './OP-11.effects.js';
import { op12EffectDefinitions } from './OP-12.effects.js';
import { op13EffectDefinitions } from './OP-13.effects.js';
import { op14EffectDefinitions } from './OP-14.effects.js';
import { op15EffectDefinitions } from './OP-15.effects.js';
import { op16EffectDefinitions } from './OP-16.effects.js';
import { opSpecialHandlers } from './special/index.js';

export const opEditionEffectDefinitions: readonly EditionEffectDefinitions[] = [
  op01EffectDefinitions,
  op02EffectDefinitions,
  op03EffectDefinitions,
  op04EffectDefinitions,
  op05EffectDefinitions,
  op06EffectDefinitions,
  op07EffectDefinitions,
  op08EffectDefinitions,
  op09EffectDefinitions,
  op10EffectDefinitions,
  op11EffectDefinitions,
  op12EffectDefinitions,
  op13EffectDefinitions,
  op14EffectDefinitions,
  op15EffectDefinitions,
  op16EffectDefinitions,
] as const;

export const opEditionSpecialHandlers: readonly SpecialHandlerDefinition[] =
  opSpecialHandlers;
