import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { eb01001CounterRuleSpecialHandler } from './EB01-001.special.js';
import { eb01038CounterRedirectAttackSpecialHandler } from './EB01-038.special.js';
import { eb01040LifeFaceUpKoCost0SpecialHandler } from './EB01-040.special.js';
import { eb01052ChooseLifeManipulationSpecialHandler } from './EB01-052.special.js';
import { eb01059MainKoAndTrashLifeSpecialHandler } from './EB01-059.special.js';
import { eb01060MainPlayEnelAndTrashLifeSpecialHandler } from './EB01-060.special.js';
import { eb01061WhenAttackingCopyPowerSpecialHandler } from './EB01-061.special.js';
import { eb02039SpecialHandler } from './EB02-039.special.js';

export const ebSpecialHandlers: readonly SpecialHandlerDefinition[] = [
  eb01001CounterRuleSpecialHandler,
  eb01038CounterRedirectAttackSpecialHandler,
  eb01040LifeFaceUpKoCost0SpecialHandler,
  eb01052ChooseLifeManipulationSpecialHandler,
  eb01059MainKoAndTrashLifeSpecialHandler,
  eb01060MainPlayEnelAndTrashLifeSpecialHandler,
  eb01061WhenAttackingCopyPowerSpecialHandler,
  eb02039SpecialHandler,
] as const;
