import type { EditionEffectDefinitions } from '../../types/effect-definition-source';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';
import { op01EffectDefinitions } from './OP-01.effects';
import { op02EffectDefinitions } from './OP-02.effects';
import { op03EffectDefinitions } from './OP-03.effects';
import { op04EffectDefinitions } from './OP-04.effects';
import { op05EffectDefinitions } from './OP-05.effects';
import { op06EffectDefinitions } from './OP-06.effects';
import { op07EffectDefinitions } from './OP-07.effects';
import { op08EffectDefinitions } from './OP-08.effects';
import { op09EffectDefinitions } from './OP-09.effects';
import { op10EffectDefinitions } from './OP-10.effects';
import { op11EffectDefinitions } from './OP-11.effects';
import { op12EffectDefinitions } from './OP-12.effects';
import { op13EffectDefinitions } from './OP-13.effects';
import { op14EffectDefinitions } from './OP-14.effects';
import { op15EffectDefinitions } from './OP-15.effects';
import { op16EffectDefinitions } from './OP-16.effects';
import { opSpecialHandlers } from './special';

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
