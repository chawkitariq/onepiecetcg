import type { EditionEffectDefinitions } from '../types/effect-definition-source';
import { op01EffectDefinitions } from './op01.effects';
import { op02EffectDefinitions } from './op02.effects';
import { op03EffectDefinitions } from './op03.effects';
import { op05EffectDefinitions } from './op05.effects';

export const effectDefinitionEditions: readonly EditionEffectDefinitions[] = [
  op01EffectDefinitions,
  op02EffectDefinitions,
  op03EffectDefinitions,
  op05EffectDefinitions,
];
