import type { ContinuousPrimitiveDefinition } from '../types/effect-definition-source';
import { plus1000DuringYourTurnContinuous } from './plus-1000-during-your-turn.continuous';

export const continuousPrimitiveDefinitions: readonly ContinuousPrimitiveDefinition[] =
  [plus1000DuringYourTurnContinuous];
