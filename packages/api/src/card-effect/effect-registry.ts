import type { CardEffectDefinition } from '@onepiecetcg/shared';
import { buildEffectRegistry, loadEffectSources } from './effect-loader';
import type { EffectRegistry } from './types/effect-registry';

/** Process-level immutable registry built once and shared across all rooms. */
export const effectRegistry: EffectRegistry = buildEffectRegistry(
  loadEffectSources(),
);

/** Rebuild helper for tests or future bootstrap hooks. */
export function createEffectRegistry(): EffectRegistry {
  return buildEffectRegistry(loadEffectSources());
}

/** Direct normalized lookup for one card definition. */
export function getEffectDefinition(
  cardId: string,
): CardEffectDefinition | undefined {
  return effectRegistry.effectsByCardId[cardId.trim().toUpperCase()];
}
