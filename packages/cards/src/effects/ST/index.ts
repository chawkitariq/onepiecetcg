import type { EditionEffectDefinitions } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { st01EffectDefinitions } from './ST-01.effects.js';
import { st02EffectDefinitions } from './ST-02.effects.js';
import { st03EffectDefinitions } from './ST-03.effects.js';
import { st04EffectDefinitions } from './ST-04.effects.js';
import { st05EffectDefinitions } from './ST-05.effects.js';
import { st06EffectDefinitions } from './ST-06.effects.js';
import { st07EffectDefinitions } from './ST-07.effects.js';
import { st08EffectDefinitions } from './ST-08.effects.js';
import { st09EffectDefinitions } from './ST-09.effects.js';
import { st10EffectDefinitions } from './ST-10.effects.js';
import { st11EffectDefinitions } from './ST-11.effects.js';
import { st12EffectDefinitions } from './ST-12.effects.js';
import { st13EffectDefinitions } from './ST-13.effects.js';
import { st14EffectDefinitions } from './ST-14.effects.js';
import { st15EffectDefinitions } from './ST-15.effects.js';
import { st16EffectDefinitions } from './ST-16.effects.js';
import { st17EffectDefinitions } from './ST-17.effects.js';
import { st18EffectDefinitions } from './ST-18.effects.js';
import { st19EffectDefinitions } from './ST-19.effects.js';
import { st20EffectDefinitions } from './ST-20.effects.js';
import { st21EffectDefinitions } from './ST-21.effects.js';
import { st22EffectDefinitions } from './ST-22.effects.js';
import { st23EffectDefinitions } from './ST-23.effects.js';
import { st24EffectDefinitions } from './ST-24.effects.js';
import { st25EffectDefinitions } from './ST-25.effects.js';
import { st26EffectDefinitions } from './ST-26.effects.js';
import { st27EffectDefinitions } from './ST-27.effects.js';
import { st28EffectDefinitions } from './ST-28.effects.js';
import { st29EffectDefinitions } from './ST-29.effects.js';
import { stSpecialHandlers } from './special/index.js';

export const stEditionEffectDefinitions: readonly EditionEffectDefinitions[] = [
  st01EffectDefinitions,
  st02EffectDefinitions,
  st03EffectDefinitions,
  st04EffectDefinitions,
  st05EffectDefinitions,
  st06EffectDefinitions,
  st07EffectDefinitions,
  st08EffectDefinitions,
  st09EffectDefinitions,
  st10EffectDefinitions,
  st11EffectDefinitions,
  st12EffectDefinitions,
  st13EffectDefinitions,
  st14EffectDefinitions,
  st15EffectDefinitions,
  st16EffectDefinitions,
  st17EffectDefinitions,
  st18EffectDefinitions,
  st19EffectDefinitions,
  st20EffectDefinitions,
  st21EffectDefinitions,
  st22EffectDefinitions,
  st23EffectDefinitions,
  st24EffectDefinitions,
  st25EffectDefinitions,
  st26EffectDefinitions,
  st27EffectDefinitions,
  st28EffectDefinitions,
  st29EffectDefinitions,
] as const;

export const stEditionSpecialHandlers: readonly SpecialHandlerDefinition[] =
  stSpecialHandlers;
