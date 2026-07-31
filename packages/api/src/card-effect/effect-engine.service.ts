import { Injectable } from '@nestjs/common';
import {
  createEffectRegistry,
  effectRegistry,
  EffectEngine,
  type EffectEngineHost,
} from '@onepiecetcg/effect-engine';

/**
 * Nest-facing factory for effect engines so other backend adapters can reuse
 * the same local registry and special-handler configuration as Colyseus rooms.
 */
@Injectable()
export class EffectEngineService {
  /** Immutable process-level registry available to Nest consumers. */
  public readonly registry = effectRegistry;

  /** Creates a fully-configured effect engine for a runtime host. */
  public create(host: EffectEngineHost): EffectEngine {
    return new EffectEngine(this.registry, host);
  }

  /** Creates a fresh registry snapshot; useful for tests and bootstrap checks. */
  public createRegistrySnapshot() {
    return createEffectRegistry();
  }
}
