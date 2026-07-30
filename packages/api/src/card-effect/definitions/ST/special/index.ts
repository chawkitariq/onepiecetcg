import type { SpecialHandlerDefinition } from '../../../types/effect-registry';
import { st01016SpecialHandler } from './ST01-016.special';
import { st08013SpecialHandler } from './ST08-013.special';
import { st13002SpecialHandler } from './ST13-002.special';
import { st13003SpecialHandler } from './ST13-003.special';
import { st13004SpecialHandler } from './ST13-004.special';
import { st13007SpecialHandler } from './ST13-007.special';
import { st13009SpecialHandler } from './ST13-009.special';
import { st13010SpecialHandler } from './ST13-010.special';
import { st13012SpecialHandler } from './ST13-012.special';
import { st13014SpecialHandler } from './ST13-014.special';
import { st13016SpecialHandler } from './ST13-016.special';
import { st21003SpecialHandler } from './ST21-003.special';
import { st27004SpecialHandler } from './ST27-004.special';
import { st28001SpecialHandler } from './ST28-001.special';

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
