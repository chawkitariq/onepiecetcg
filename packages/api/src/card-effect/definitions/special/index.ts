import type { SpecialHandlerDefinition } from '../../types/effect-registry';
import { eb01001CounterRuleSpecialHandler } from './eb01-001.special';
import { eb01038CounterRedirectAttackSpecialHandler } from './eb01-038.special';
import { eb01040LifeFaceUpKoCost0SpecialHandler } from './eb01-040.special';
import { eb01052ChooseLifeManipulationSpecialHandler } from './eb01-052.special';
import { eb01059MainKoAndTrashLifeSpecialHandler } from './eb01-059.special';
import { eb01060MainPlayEnelAndTrashLifeSpecialHandler } from './eb01-060.special';
import { eb01061WhenAttackingCopyPowerSpecialHandler } from './eb01-061.special';
import { eb02039SpecialHandler } from './eb02-039.special';
import { op04047SpecialHandler } from './op04-047.special';
import { op04048SpecialHandler } from './op04-048.special';
import { op05002SpecialHandler } from './op05-002.special';
import { op05007SpecialHandler } from './op05-007.special';
import { op05019SpecialHandler } from './op05-019.special';
import { op05043SpecialHandler } from './op05-043.special';
import { op05058SpecialHandler } from './op05-058.special';
import { op05099SpecialHandler } from './op05-099.special';
import { op05119SpecialHandler } from './op05-119.special';
import { op06009SpecialHandler } from './op06-009.special';
import { op06074SpecialHandler } from './op06-074.special';
import { op06083SpecialHandler } from './op06-083.special';
import { op06116SpecialHandler } from './op06-116.special';
import { op07029SpecialHandler } from './op07-029.special';
import { op07042SpecialHandler } from './op07-042.special';
import { op07091SpecialHandler } from './op07-091.special';
import { op07097SpecialHandler } from './op07-097.special';
import { op08043SpecialHandler } from './op08-043.special';
import { op08046SpecialHandler } from './op08-046.special';
import { op08062SpecialHandler } from './op08-062.special';
import { op08069SpecialHandler } from './op08-069.special';
import { op08079SpecialHandler } from './op08-079.special';
import { op08096SpecialHandler } from './op08-096.special';
import { op08098SpecialHandler } from './op08-098.special';
import { op08118SpecialHandler } from './op08-118.special';
import { op08119SpecialHandler } from './op08-119.special';
import { op09018SpecialHandler } from './op09-018.special';
import { op09022SpecialHandler } from './op09-022.special';
import { op09052SpecialHandler } from './op09-052.special';
import { op09058SpecialHandler } from './op09-058.special';
import { op09059SpecialHandler } from './op09-059.special';
import { op09080SpecialHandler } from './op09-080.special';
import { op09081SpecialHandler } from './op09-081.special';
import { op09093SpecialHandler } from './op09-093.special';
import { op09098SpecialHandler } from './op09-098.special';
import { op09101SpecialHandler } from './op09-101.special';
import { op09118SpecialHandler } from './op09-118.special';
import { op10022SpecialHandler } from './op10-022.special';
import { op10026SpecialHandler } from './op10-026.special';
import { op10027SpecialHandler } from './op10-027.special';
import { op10030SpecialHandler } from './op10-030.special';
import { op10032SpecialHandler } from './op10-032.special';
import { op10034SpecialHandler } from './op10-034.special';
import { op10036SpecialHandler } from './op10-036.special';
import { op10042SpecialHandler } from './op10-042.special';
import { op10058SpecialHandler } from './op10-058.special';
import { op10085SpecialHandler } from './op10-085.special';
import { op10087SpecialHandler } from './op10-087.special';
import { op10092SpecialHandler } from './op10-092.special';
import { op10098SpecialHandler } from './op10-098.special';
import { op10099SpecialHandler } from './op10-099.special';
import { op10100SpecialHandler } from './op10-100.special';
import { op10103SpecialHandler } from './op10-103.special';
import { op10104SpecialHandler } from './op10-104.special';
import { op10107SpecialHandler } from './op10-107.special';
import { op10110SpecialHandler } from './op10-110.special';
import { op10113SpecialHandler } from './op10-113.special';
import { op10115SpecialHandler } from './op10-115.special';
import { op10116SpecialHandler } from './op10-116.special';
import { op10118SpecialHandler } from './op10-118.special';
import { op10119SpecialHandler } from './op10-119.special';
import { op11001SpecialHandler } from './op11-001.special';
import { op11022SpecialHandler } from './op11-022.special';
import { op11023SpecialHandler } from './op11-023.special';
import { op11034SpecialHandler } from './op11-034.special';
import { op11041SpecialHandler } from './op11-041.special';
import { op11066SpecialHandler } from './op11-066.special';
import { op11071SpecialHandler } from './op11-071.special';
import { op11073SpecialHandler } from './op11-073.special';
import { op11074SpecialHandler } from './op11-074.special';
import { op11079SpecialHandler } from './op11-079.special';
import { op11081SpecialHandler } from './op11-081.special';
import { op11101SpecialHandler } from './op11-101.special';
import { op12020SpecialHandler } from './op12-020.special';
import { op13001SpecialHandler } from './op13-001.special';
import { op13002SpecialHandler } from './op13-002.special';
import { op13003SpecialHandler } from './op13-003.special';
import { op13007SpecialHandler } from './op13-007.special';
import { op13016SpecialHandler } from './op13-016.special';
import { op13017SpecialHandler } from './op13-017.special';
import { op13023SpecialHandler } from './op13-023.special';
import { op13028SpecialHandler } from './op13-028.special';
import { op13032SpecialHandler } from './op13-032.special';
import { op13057SpecialHandler } from './op13-057.special';
import { op13064SpecialHandler } from './op13-064.special';
import { op13079SpecialHandler } from './op13-079.special';
import { op13082SpecialHandler } from './op13-082.special';
import { op13091SpecialHandler } from './op13-091.special';
import { op13099SpecialHandler } from './op13-099.special';
import { op13102SpecialHandler } from './op13-102.special';
import { op13105SpecialHandler } from './op13-105.special';
import { op13106SpecialHandler } from './op13-106.special';
import { op13109SpecialHandler } from './op13-109.special';
import { op13114SpecialHandler } from './op13-114.special';
import { op13117SpecialHandler } from './op13-117.special';
import { op13118SpecialHandler } from './op13-118.special';
import { op13119SpecialHandler } from './op13-119.special';
import { op14001SpecialHandler } from './op14-001.special';
import { op14009SpecialHandler } from './op14-009.special';
import { op14017SpecialHandler } from './op14-017.special';
import { op14020SpecialHandler } from './op14-020.special';
import { op14021SpecialHandler } from './op14-021.special';
import { op14033SpecialHandler } from './op14-033.special';
import { op14035SpecialHandler } from './op14-035.special';
import { op14053SpecialHandler } from './op14-053.special';
import { op14056SpecialHandler } from './op14-056.special';
import { op14060SpecialHandler } from './op14-060.special';
import { op14062SpecialHandler } from './op14-062.special';
import { op14069SpecialHandler } from './op14-069.special';
import { op14070SpecialHandler } from './op14-070.special';
import { op14079SpecialHandler } from './op14-079.special';
import { op14096SpecialHandler } from './op14-096.special';
import { op14103SpecialHandler } from './op14-103.special';
import { op14104SpecialHandler } from './op14-104.special';
import { op14105SpecialHandler } from './op14-105.special';
import { op14111SpecialHandler } from './op14-111.special';
import { op14115SpecialHandler } from './op14-115.special';
import { op14119SpecialHandler } from './op14-119.special';
import { op15001SpecialHandler } from './op15-001.special';
import { op15002SpecialHandler } from './op15-002.special';
import { op15008SpecialHandler } from './op15-008.special';
import { op15014SpecialHandler } from './op15-014.special';
import { op15020SpecialHandler } from './op15-020.special';
import { op15029SpecialHandler } from './op15-029.special';
import { op15031SpecialHandler } from './op15-031.special';
import { op15046SpecialHandler } from './op15-046.special';
import { op15058SpecialHandler } from './op15-058.special';
import { op15059SpecialHandler } from './op15-059.special';
import { op15070SpecialHandler } from './op15-070.special';
import { op15071SpecialHandler } from './op15-071.special';
import { op15086SpecialHandler } from './op15-086.special';
import { op15092SpecialHandler } from './op15-092.special';
import { op15119SpecialHandler } from './op15-119.special';
import { op16032SpecialHandler } from './op16-032.special';
import { op16041SpecialHandler } from './op16-041.special';
import { op16079SpecialHandler } from './op16-079.special';
import { op16080SpecialHandler } from './op16-080.special';
import { op16084SpecialHandler } from './op16-084.special';
import { op16115SpecialHandler } from './op16-115.special';
import { op16118SpecialHandler } from './op16-118.special';
import { op16119SpecialHandler } from './op16-119.special';
import { st01016SpecialHandler } from './st01-016.special';
import { st08013SpecialHandler } from './st08-013.special';
import { st13002SpecialHandler } from './st13-002.special';
import { st13003SpecialHandler } from './st13-003.special';
import { st13004SpecialHandler } from './st13-004.special';
import { st13007SpecialHandler } from './st13-007.special';
import { st13009SpecialHandler } from './st13-009.special';
import { st13010SpecialHandler } from './st13-010.special';
import { st13012SpecialHandler } from './st13-012.special';
import { st13014SpecialHandler } from './st13-014.special';
import { st13016SpecialHandler } from './st13-016.special';

export const specialHandlerDefinitions: readonly SpecialHandlerDefinition[] = [
  eb01001CounterRuleSpecialHandler,
  eb01038CounterRedirectAttackSpecialHandler,
  eb01040LifeFaceUpKoCost0SpecialHandler,
  eb01052ChooseLifeManipulationSpecialHandler,
  eb01059MainKoAndTrashLifeSpecialHandler,
  eb01060MainPlayEnelAndTrashLifeSpecialHandler,
  eb01061WhenAttackingCopyPowerSpecialHandler,
  eb02039SpecialHandler,
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
] as const;
