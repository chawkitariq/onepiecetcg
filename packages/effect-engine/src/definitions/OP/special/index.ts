import type { SpecialHandlerDefinition } from '../../../types/effect-registry';
import { op04047SpecialHandler } from './OP04-047.special';
import { op04048SpecialHandler } from './OP04-048.special';
import { op05002SpecialHandler } from './OP05-002.special';
import { op05007SpecialHandler } from './OP05-007.special';
import { op05019SpecialHandler } from './OP05-019.special';
import { op05043SpecialHandler } from './OP05-043.special';
import { op05058SpecialHandler } from './OP05-058.special';
import { op05099SpecialHandler } from './OP05-099.special';
import { op05119SpecialHandler } from './OP05-119.special';
import { op06009SpecialHandler } from './OP06-009.special';
import { op06074SpecialHandler } from './OP06-074.special';
import { op06083SpecialHandler } from './OP06-083.special';
import { op06116SpecialHandler } from './OP06-116.special';
import { op07029SpecialHandler } from './OP07-029.special';
import { op07042SpecialHandler } from './OP07-042.special';
import { op07091SpecialHandler } from './OP07-091.special';
import { op07097SpecialHandler } from './OP07-097.special';
import { op08043SpecialHandler } from './OP08-043.special';
import { op08046SpecialHandler } from './OP08-046.special';
import { op08062SpecialHandler } from './OP08-062.special';
import { op08069SpecialHandler } from './OP08-069.special';
import { op08079SpecialHandler } from './OP08-079.special';
import { op08096SpecialHandler } from './OP08-096.special';
import { op08098SpecialHandler } from './OP08-098.special';
import { op08118SpecialHandler } from './OP08-118.special';
import { op08119SpecialHandler } from './OP08-119.special';
import { op09018SpecialHandler } from './OP09-018.special';
import { op09022SpecialHandler } from './OP09-022.special';
import { op09052SpecialHandler } from './OP09-052.special';
import { op09058SpecialHandler } from './OP09-058.special';
import { op09059SpecialHandler } from './OP09-059.special';
import { op09080SpecialHandler } from './OP09-080.special';
import { op09081SpecialHandler } from './OP09-081.special';
import { op09093SpecialHandler } from './OP09-093.special';
import { op09098SpecialHandler } from './OP09-098.special';
import { op09101SpecialHandler } from './OP09-101.special';
import { op09118SpecialHandler } from './OP09-118.special';
import { op10022SpecialHandler } from './OP10-022.special';
import { op10026SpecialHandler } from './OP10-026.special';
import { op10027SpecialHandler } from './OP10-027.special';
import { op10030SpecialHandler } from './OP10-030.special';
import { op10032SpecialHandler } from './OP10-032.special';
import { op10034SpecialHandler } from './OP10-034.special';
import { op10036SpecialHandler } from './OP10-036.special';
import { op10042SpecialHandler } from './OP10-042.special';
import { op10058SpecialHandler } from './OP10-058.special';
import { op10085SpecialHandler } from './OP10-085.special';
import { op10087SpecialHandler } from './OP10-087.special';
import { op10092SpecialHandler } from './OP10-092.special';
import { op10098SpecialHandler } from './OP10-098.special';
import { op10099SpecialHandler } from './OP10-099.special';
import { op10100SpecialHandler } from './OP10-100.special';
import { op10103SpecialHandler } from './OP10-103.special';
import { op10104SpecialHandler } from './OP10-104.special';
import { op10107SpecialHandler } from './OP10-107.special';
import { op10110SpecialHandler } from './OP10-110.special';
import { op10113SpecialHandler } from './OP10-113.special';
import { op10115SpecialHandler } from './OP10-115.special';
import { op10116SpecialHandler } from './OP10-116.special';
import { op10118SpecialHandler } from './OP10-118.special';
import { op10119SpecialHandler } from './OP10-119.special';
import { op11001SpecialHandler } from './OP11-001.special';
import { op11022SpecialHandler } from './OP11-022.special';
import { op11023SpecialHandler } from './OP11-023.special';
import { op11034SpecialHandler } from './OP11-034.special';
import { op11041SpecialHandler } from './OP11-041.special';
import { op11066SpecialHandler } from './OP11-066.special';
import { op11071SpecialHandler } from './OP11-071.special';
import { op11073SpecialHandler } from './OP11-073.special';
import { op11074SpecialHandler } from './OP11-074.special';
import { op11079SpecialHandler } from './OP11-079.special';
import { op11081SpecialHandler } from './OP11-081.special';
import { op11101SpecialHandler } from './OP11-101.special';
import { op12020SpecialHandler } from './OP12-020.special';
import { op13001SpecialHandler } from './OP13-001.special';
import { op13002SpecialHandler } from './OP13-002.special';
import { op13003SpecialHandler } from './OP13-003.special';
import { op13007SpecialHandler } from './OP13-007.special';
import { op13016SpecialHandler } from './OP13-016.special';
import { op13017SpecialHandler } from './OP13-017.special';
import { op13023SpecialHandler } from './OP13-023.special';
import { op13028SpecialHandler } from './OP13-028.special';
import { op13032SpecialHandler } from './OP13-032.special';
import { op13057SpecialHandler } from './OP13-057.special';
import { op13064SpecialHandler } from './OP13-064.special';
import { op13079SpecialHandler } from './OP13-079.special';
import { op13082SpecialHandler } from './OP13-082.special';
import { op13091SpecialHandler } from './OP13-091.special';
import { op13099SpecialHandler } from './OP13-099.special';
import { op13102SpecialHandler } from './OP13-102.special';
import { op13105SpecialHandler } from './OP13-105.special';
import { op13106SpecialHandler } from './OP13-106.special';
import { op13109SpecialHandler } from './OP13-109.special';
import { op13114SpecialHandler } from './OP13-114.special';
import { op13117SpecialHandler } from './OP13-117.special';
import { op13118SpecialHandler } from './OP13-118.special';
import { op13119SpecialHandler } from './OP13-119.special';
import { op14001SpecialHandler } from './OP14-001.special';
import { op14009SpecialHandler } from './OP14-009.special';
import { op14017SpecialHandler } from './OP14-017.special';
import { op14020SpecialHandler } from './OP14-020.special';
import { op14021SpecialHandler } from './OP14-021.special';
import { op14033SpecialHandler } from './OP14-033.special';
import { op14035SpecialHandler } from './OP14-035.special';
import { op14053SpecialHandler } from './OP14-053.special';
import { op14056SpecialHandler } from './OP14-056.special';
import { op14060SpecialHandler } from './OP14-060.special';
import { op14062SpecialHandler } from './OP14-062.special';
import { op14069SpecialHandler } from './OP14-069.special';
import { op14070SpecialHandler } from './OP14-070.special';
import { op14079SpecialHandler } from './OP14-079.special';
import { op14096SpecialHandler } from './OP14-096.special';
import { op14103SpecialHandler } from './OP14-103.special';
import { op14104SpecialHandler } from './OP14-104.special';
import { op14105SpecialHandler } from './OP14-105.special';
import { op14111SpecialHandler } from './OP14-111.special';
import { op14115SpecialHandler } from './OP14-115.special';
import { op14119SpecialHandler } from './OP14-119.special';
import { op15001SpecialHandler } from './OP15-001.special';
import { op15002SpecialHandler } from './OP15-002.special';
import { op15008SpecialHandler } from './OP15-008.special';
import { op15014SpecialHandler } from './OP15-014.special';
import { op15020SpecialHandler } from './OP15-020.special';
import { op15029SpecialHandler } from './OP15-029.special';
import { op15031SpecialHandler } from './OP15-031.special';
import { op15046SpecialHandler } from './OP15-046.special';
import { op15058SpecialHandler } from './OP15-058.special';
import { op15059SpecialHandler } from './OP15-059.special';
import { op15070SpecialHandler } from './OP15-070.special';
import { op15071SpecialHandler } from './OP15-071.special';
import { op15086SpecialHandler } from './OP15-086.special';
import { op15092SpecialHandler } from './OP15-092.special';
import { op15119SpecialHandler } from './OP15-119.special';
import { op16032SpecialHandler } from './OP16-032.special';
import { op16041SpecialHandler } from './OP16-041.special';
import { op16079SpecialHandler } from './OP16-079.special';
import { op16080SpecialHandler } from './OP16-080.special';
import { op16084SpecialHandler } from './OP16-084.special';
import { op16115SpecialHandler } from './OP16-115.special';
import { op16118SpecialHandler } from './OP16-118.special';
import { op16119SpecialHandler } from './OP16-119.special';

export const opSpecialHandlers: readonly SpecialHandlerDefinition[] = [
  op04047SpecialHandler,
  op04048SpecialHandler,
  op05002SpecialHandler,
  op05007SpecialHandler,
  op05019SpecialHandler,
  op05043SpecialHandler,
  op05058SpecialHandler,
  op05099SpecialHandler,
  op05119SpecialHandler,
  op06009SpecialHandler,
  op06074SpecialHandler,
  op06083SpecialHandler,
  op06116SpecialHandler,
  op07029SpecialHandler,
  op07042SpecialHandler,
  op07091SpecialHandler,
  op07097SpecialHandler,
  op08043SpecialHandler,
  op08046SpecialHandler,
  op08062SpecialHandler,
  op08069SpecialHandler,
  op08079SpecialHandler,
  op08096SpecialHandler,
  op08098SpecialHandler,
  op08118SpecialHandler,
  op08119SpecialHandler,
  op09018SpecialHandler,
  op09022SpecialHandler,
  op09052SpecialHandler,
  op09058SpecialHandler,
  op09059SpecialHandler,
  op09080SpecialHandler,
  op09081SpecialHandler,
  op09093SpecialHandler,
  op09098SpecialHandler,
  op09101SpecialHandler,
  op09118SpecialHandler,
  op10022SpecialHandler,
  op10026SpecialHandler,
  op10027SpecialHandler,
  op10030SpecialHandler,
  op10032SpecialHandler,
  op10034SpecialHandler,
  op10036SpecialHandler,
  op10042SpecialHandler,
  op10058SpecialHandler,
  op10085SpecialHandler,
  op10087SpecialHandler,
  op10092SpecialHandler,
  op10098SpecialHandler,
  op10099SpecialHandler,
  op10100SpecialHandler,
  op10103SpecialHandler,
  op10104SpecialHandler,
  op10107SpecialHandler,
  op10110SpecialHandler,
  op10113SpecialHandler,
  op10115SpecialHandler,
  op10116SpecialHandler,
  op10118SpecialHandler,
  op10119SpecialHandler,
  op11001SpecialHandler,
  op11022SpecialHandler,
  op11023SpecialHandler,
  op11034SpecialHandler,
  op11041SpecialHandler,
  op11066SpecialHandler,
  op11071SpecialHandler,
  op11073SpecialHandler,
  op11074SpecialHandler,
  op11079SpecialHandler,
  op11081SpecialHandler,
  op11101SpecialHandler,
  op12020SpecialHandler,
  op13001SpecialHandler,
  op13002SpecialHandler,
  op13003SpecialHandler,
  op13007SpecialHandler,
  op13016SpecialHandler,
  op13017SpecialHandler,
  op13023SpecialHandler,
  op13028SpecialHandler,
  op13032SpecialHandler,
  op13057SpecialHandler,
  op13064SpecialHandler,
  op13079SpecialHandler,
  op13082SpecialHandler,
  op13091SpecialHandler,
  op13099SpecialHandler,
  op13102SpecialHandler,
  op13105SpecialHandler,
  op13106SpecialHandler,
  op13109SpecialHandler,
  op13114SpecialHandler,
  op13117SpecialHandler,
  op13118SpecialHandler,
  op13119SpecialHandler,
  op14001SpecialHandler,
  op14009SpecialHandler,
  op14017SpecialHandler,
  op14020SpecialHandler,
  op14021SpecialHandler,
  op14033SpecialHandler,
  op14035SpecialHandler,
  op14053SpecialHandler,
  op14056SpecialHandler,
  op14060SpecialHandler,
  op14062SpecialHandler,
  op14069SpecialHandler,
  op14070SpecialHandler,
  op14079SpecialHandler,
  op14096SpecialHandler,
  op14103SpecialHandler,
  op14104SpecialHandler,
  op14105SpecialHandler,
  op14111SpecialHandler,
  op14115SpecialHandler,
  op14119SpecialHandler,
  op15001SpecialHandler,
  op15002SpecialHandler,
  op15008SpecialHandler,
  op15014SpecialHandler,
  op15020SpecialHandler,
  op15029SpecialHandler,
  op15031SpecialHandler,
  op15046SpecialHandler,
  op15058SpecialHandler,
  op15059SpecialHandler,
  op15070SpecialHandler,
  op15071SpecialHandler,
  op15086SpecialHandler,
  op15092SpecialHandler,
  op15119SpecialHandler,
  op16032SpecialHandler,
  op16041SpecialHandler,
  op16079SpecialHandler,
  op16080SpecialHandler,
  op16084SpecialHandler,
  op16115SpecialHandler,
  op16118SpecialHandler,
  op16119SpecialHandler,
] as const;
