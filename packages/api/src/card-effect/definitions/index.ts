import type { EditionEffectDefinitions } from '../types/effect-definition-source';
import { op01EffectDefinitions } from './op01.effects';
import { op02EffectDefinitions } from './op02.effects';
import { op03EffectDefinitions } from './op03.effects';
import { op04EffectDefinitions } from './op04.effects';
import { op05EffectDefinitions } from './op05.effects';
import { op06EffectDefinitions } from './op06.effects';

export const effectDefinitionEditions: readonly EditionEffectDefinitions[] = [
  op01EffectDefinitions,
  op02EffectDefinitions,
  op03EffectDefinitions,
  op04EffectDefinitions,
  op05EffectDefinitions,
  op06EffectDefinitions,
];
