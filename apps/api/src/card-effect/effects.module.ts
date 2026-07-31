import { Module } from '@nestjs/common';
import { EffectEngineService } from './effect-engine.service';

/** Game-domain module that owns effect loading, registries, and resolvers. */
@Module({
  providers: [EffectEngineService],
  exports: [EffectEngineService],
})
export class EffectsModule {}
