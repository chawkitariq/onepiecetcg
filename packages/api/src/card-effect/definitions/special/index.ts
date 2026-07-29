import type { SpecialHandlerDefinition } from '../../types/effect-registry';
import { op04040SpecialHandler } from './op04-040.special';
import { op04047SpecialHandler } from './op04-047.special';
import { op04048SpecialHandler } from './op04-048.special';
import { op04116SpecialHandler } from './op04-116.special';

export const specialHandlerDefinitions: readonly SpecialHandlerDefinition[] = [
  op04040SpecialHandler,
  op04047SpecialHandler,
  op04048SpecialHandler,
  op04116SpecialHandler,
] as const;
