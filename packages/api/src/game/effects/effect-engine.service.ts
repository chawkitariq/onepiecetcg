import { Injectable } from '@nestjs/common';
import type { CardEffectDefinition } from '@onepiecetcg/shared';
import { EffectEngine, type EffectEngineHost } from './effect-engine';
import { effectRegistry, registerCardEffects } from './effect-registry';
import { sampleEffectDefinitions } from './sample-effect-definitions';
import { specialEffectRegistry } from './special-effect-registry';

/**
 * Nest-facing factory for effect engines so other backend adapters can reuse
 * the same local registry and special-handler configuration as Colyseus rooms.
 */
@Injectable()
export class EffectEngineService {
  public constructor() {
    registerCardEffects(sampleEffectDefinitions);
  }

  /** Registers additional local card definitions into the authoritative registry. */
  public register(definitions: CardEffectDefinition[]): void {
    registerCardEffects(definitions);
  }

  /** Creates a fully-configured effect engine for a runtime host. */
  public create(host: EffectEngineHost): EffectEngine {
    return new EffectEngine(effectRegistry, host, specialEffectRegistry);
  }
}
