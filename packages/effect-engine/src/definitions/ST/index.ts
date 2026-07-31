import type { EditionEffectDefinitions } from '../../types/effect-definition-source';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';
import { st01EffectDefinitions } from './ST-01.effects';
import { st02EffectDefinitions } from './ST-02.effects';
import { st03EffectDefinitions } from './ST-03.effects';
import { st04EffectDefinitions } from './ST-04.effects';
import { st05EffectDefinitions } from './ST-05.effects';
import { st06EffectDefinitions } from './ST-06.effects';
import { st07EffectDefinitions } from './ST-07.effects';
import { st08EffectDefinitions } from './ST-08.effects';
import { st09EffectDefinitions } from './ST-09.effects';
import { st10EffectDefinitions } from './ST-10.effects';
import { st11EffectDefinitions } from './ST-11.effects';
import { st12EffectDefinitions } from './ST-12.effects';
import { st13EffectDefinitions } from './ST-13.effects';
import { st14EffectDefinitions } from './ST-14.effects';
import { st15EffectDefinitions } from './ST-15.effects';
import { st16EffectDefinitions } from './ST-16.effects';
import { st17EffectDefinitions } from './ST-17.effects';
import { st18EffectDefinitions } from './ST-18.effects';
import { st19EffectDefinitions } from './ST-19.effects';
import { st20EffectDefinitions } from './ST-20.effects';
import { st21EffectDefinitions } from './ST-21.effects';
import { st22EffectDefinitions } from './ST-22.effects';
import { st23EffectDefinitions } from './ST-23.effects';
import { st24EffectDefinitions } from './ST-24.effects';
import { st25EffectDefinitions } from './ST-25.effects';
import { st26EffectDefinitions } from './ST-26.effects';
import { st27EffectDefinitions } from './ST-27.effects';
import { st28EffectDefinitions } from './ST-28.effects';
import { st29EffectDefinitions } from './ST-29.effects';
import { stSpecialHandlers } from './special';

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
