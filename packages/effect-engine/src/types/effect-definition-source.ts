import type {
  CardEffectDefinition,
  CardEffectEntry,
  CardEffectSource,
  EditionEffectDefinitions,
} from '@onepiecetcg/shared';
import type { CardId } from './effect-registry';
export type { CardEffectEntry, CardEffectSource, EditionEffectDefinitions };

export interface ResolvedCardEffectDefinition extends CardEffectDefinition {}
