import type { SpecialHandlerDefinition } from '../../types/effect-registry';
import { op01047SpecialHandler } from './handlers/op01-047.special';

export const specialHandlerDefinitions: readonly SpecialHandlerDefinition[] = [
  op01047SpecialHandler,
] as const;
