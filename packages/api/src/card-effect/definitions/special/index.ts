import type { SpecialHandlerDefinition } from '../../types/effect-registry';
import { ebSpecialHandlers } from '../EB/special';
import { opSpecialHandlers } from '../OP/special';
import { stSpecialHandlers } from '../ST/special';

export const specialHandlerDefinitions: readonly SpecialHandlerDefinition[] = [
  ...ebSpecialHandlers,
  ...opSpecialHandlers,
  ...stSpecialHandlers,
] as const;
