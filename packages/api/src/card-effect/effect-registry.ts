import { loadEffectSources } from '@onepiecetcg/cards/effects';
import { buildEffectRegistry } from '@onepiecetcg/effect-engine';

/** Process-level immutable registry built from the cards package sources. */
export const effectRegistry = buildEffectRegistry(loadEffectSources());

/** Rebuild helper for tests or bootstrap checks. */
export function createEffectRegistrySnapshot() {
  return buildEffectRegistry(loadEffectSources());
}

