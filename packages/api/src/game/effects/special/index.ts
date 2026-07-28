import type { SpecialHandlerDefinition } from '../types/effect-registry';
import { trafalgarLawOnPlayHandler } from './handlers/trafalgar-law-on-play.special';

export const specialHandlerDefinitions: readonly SpecialHandlerDefinition[] = [
  trafalgarLawOnPlayHandler,
] as const;
