import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { st01016SpecialHandler } from './ST01-016.special.js';
import { st08013SpecialHandler } from './ST08-013.special.js';
import { st13002SpecialHandler } from './ST13-002.special.js';
import { st13003SpecialHandler } from './ST13-003.special.js';
import { st13004SpecialHandler } from './ST13-004.special.js';
import { st13007SpecialHandler } from './ST13-007.special.js';
import { st13009SpecialHandler } from './ST13-009.special.js';
import { st13010SpecialHandler } from './ST13-010.special.js';
import { st13012SpecialHandler } from './ST13-012.special.js';
import { st13014SpecialHandler } from './ST13-014.special.js';
import { st13016SpecialHandler } from './ST13-016.special.js';
import { st21003SpecialHandler } from './ST21-003.special.js';
import { st27004SpecialHandler } from './ST27-004.special.js';
import { st28001SpecialHandler } from './ST28-001.special.js';

export const stSpecialHandlers: readonly SpecialHandlerDefinition[] = [
  st01016SpecialHandler,
  st08013SpecialHandler,
  st13002SpecialHandler,
  st13003SpecialHandler,
  st13004SpecialHandler,
  st13007SpecialHandler,
  st13009SpecialHandler,
  st13010SpecialHandler,
  st13012SpecialHandler,
  st13014SpecialHandler,
  st13016SpecialHandler,
  st21003SpecialHandler,
  st27004SpecialHandler,
  st28001SpecialHandler,
] as const;
