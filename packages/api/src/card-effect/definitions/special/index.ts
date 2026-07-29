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
import { op06014SpecialHandler } from './op06-014.special';
import { op06039SpecialHandler } from './op06-039.special';
import { op06062SpecialHandler } from './op06-062.special';
import { op06072SpecialHandler } from './op06-072.special';
import { op06074SpecialHandler } from './op06-074.special';
import { op06083SpecialHandler } from './op06-083.special';
import { op06086SpecialHandler } from './op06-086.special';
import { op06095SpecialHandler } from './op06-095.special';
import { op06099SpecialHandler } from './op06-099.special';
import { op06103SpecialHandler } from './op06-103.special';
import { op06106SpecialHandler } from './op06-106.special';
import { op06107SpecialHandler } from './op06-107.special';
import { op06116SpecialHandler } from './op06-116.special';
import { op06117SpecialHandler } from './op06-117.special';

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
  op06014SpecialHandler,
  op06039SpecialHandler,
  op06062SpecialHandler,
  op06072SpecialHandler,
  op06074SpecialHandler,
  op06083SpecialHandler,
  op06086SpecialHandler,
  op06095SpecialHandler,
  op06099SpecialHandler,
  op06103SpecialHandler,
  op06106SpecialHandler,
  op06107SpecialHandler,
  op06116SpecialHandler,
  op06117SpecialHandler,
] as const;
