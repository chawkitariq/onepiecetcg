import type {
  CardEffectDefinition,
  ContinuousEffectDefinition,
  ReplacementEffectDefinition,
  StandardEffectDefinition,
} from '@onepiecetcg/shared';
import type { CardId } from './effect-registry';

export type ReplacementPrimitiveId = string;

export type ContinuousPrimitiveId = string;

export type SpecialHandlerId = string;

export type StandardEffectSource = {
  kind: 'standard';
  effect: StandardEffectDefinition;
};

export type ContinuousEffectSource =
  | {
      kind: 'continuous';
      effect: ContinuousEffectDefinition;
    }
  | {
      kind: 'continuous-ref';
      primitiveId: ContinuousPrimitiveId;
    };

export type ReplacementEffectSource =
  | {
      kind: 'replacement';
      effect: ReplacementEffectDefinition;
    }
  | {
      kind: 'replacement-ref';
      primitiveId: ReplacementPrimitiveId;
    };

export type SpecialHandlerSource = {
  kind: 'special-ref';
  specialHandlerId: SpecialHandlerId;
};

export interface GeneratedCardEffectDefinition {
  cardId: CardId;
  standards?: readonly StandardEffectSource[];
  continuous?: readonly ContinuousEffectSource[];
  replacements?: readonly ReplacementEffectSource[];
  special?: SpecialHandlerSource;
}

export interface OverrideCardEffectDefinition extends GeneratedCardEffectDefinition {}

export interface ReplacementPrimitiveDefinition {
  id: ReplacementPrimitiveId;
  effect: ReplacementEffectDefinition;
}

export interface ContinuousPrimitiveDefinition {
  id: ContinuousPrimitiveId;
  effect: ContinuousEffectDefinition;
}

export interface ResolvedCardEffectDefinition extends CardEffectDefinition {}
