import type { SpecialHandlerDefinition } from '../../types/effect-registry';
import { op04040SpecialHandler } from './op04-040.special';
import { op04047SpecialHandler } from './op04-047.special';
import { op04048SpecialHandler } from './op04-048.special';
import { op04116SpecialHandler } from './op04-116.special';
import { op05060SpecialHandler } from './op05-060.special';
import { op05114SpecialHandler } from './op05-114.special';
import { op05007SpecialHandler } from './op05-007.special';
import { op05043SpecialHandler } from './op05-043.special';
import { op05019SpecialHandler } from './op05-019.special';
import { op05002SpecialHandler } from './op05-002.special';
import { op05058SpecialHandler } from './op05-058.special';
import { op05099SpecialHandler } from './op05-099.special';
import { op05119SpecialHandler } from './op05-119.special';
import { op06009SpecialHandler } from './op06-009.special';
import { op06074SpecialHandler } from './op06-074.special';
import { op06083SpecialHandler } from './op06-083.special';
import { op06116SpecialHandler } from './op06-116.special';

export const specialHandlerDefinitions: readonly SpecialHandlerDefinition[] = [
  op04040SpecialHandler,
  op04047SpecialHandler,
  op04048SpecialHandler,
  op04116SpecialHandler,
  op05060SpecialHandler,
  op05114SpecialHandler,
  op05007SpecialHandler,
  op05043SpecialHandler,
  op05019SpecialHandler,
  op05002SpecialHandler,
  op05058SpecialHandler,
  op05099SpecialHandler,
  op05119SpecialHandler,
  op06009SpecialHandler,
  op06074SpecialHandler,
  op06083SpecialHandler,
  op06116SpecialHandler,
] as const;
