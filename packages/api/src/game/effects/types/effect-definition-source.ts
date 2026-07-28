import type {
  CardEffectDefinition,
  ContinuousEffectDefinition,
  ReplacementEffectDefinition,
  StandardEffectDefinition,
} from '@onepiecetcg/shared';
import type { CardId } from './effect-registry';

export type SpecialHandlerId = string;

export type CardEffectEntry =
  | {
      kind: 'standard';
      effect: StandardEffectDefinition;
    }
  | {
      kind: 'continuous';
      effect: ContinuousEffectDefinition;
    }
  | {
      kind: 'replacement';
      effect: ReplacementEffectDefinition;
    }
  | {
      kind: 'special-ref';
      specialHandlerId: SpecialHandlerId;
    };

export interface CardEffectSource {
  cardId: CardId;
  effects?: readonly CardEffectEntry[];
}

export interface EditionEffectDefinitions {
  editionId: string;
  cards: readonly CardEffectSource[];
}

export interface ResolvedCardEffectDefinition extends CardEffectDefinition {}
