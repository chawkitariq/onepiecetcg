import type {
  CardEffectDefinition,
  ContinuousEffectDefinition,
  EffectTriggerType,
  ReplacementEffectDefinition,
  StandardEffectDefinition,
} from '@onepiecetcg/shared';
import type { EffectEngine, EffectEvent } from '../effect-engine';
import type {
  ContinuousPrimitiveDefinition,
  GeneratedCardEffectDefinition,
  OverrideCardEffectDefinition,
  ReplacementPrimitiveDefinition,
} from './effect-definition-source';

export type CardId = string;

export type TriggerType = EffectTriggerType;

export type EventType = ReplacementEffectDefinition['event'];

export type EffectDefinition = CardEffectDefinition;

export type StandardEffect = StandardEffectDefinition;

export type ReplacementEffect = ReplacementEffectDefinition;

export type ContinuousEffect = ContinuousEffectDefinition;

export interface SpecialHandlerDefinition {
  id: string;
  cardId: CardId;
  resolve(event: EffectEvent, engine: EffectEngine): void;
}

export interface EffectSourceBundle {
  generated: readonly GeneratedCardEffectDefinition[];
  overrides: readonly OverrideCardEffectDefinition[];
  replacementPrimitives: readonly ReplacementPrimitiveDefinition[];
  continuousPrimitives: readonly ContinuousPrimitiveDefinition[];
  specialHandlers: readonly SpecialHandlerDefinition[];
}

export interface TriggeredEffectReference {
  cardId: CardId;
  effect: StandardEffectDefinition;
}

export interface ReplacementEffectReference {
  cardId: CardId;
  effect: ReplacementEffectDefinition;
}

export type TriggerIndex = Readonly<
  Record<TriggerType, readonly TriggeredEffectReference[]>
>;

export type ReplacementIndex = Readonly<
  Record<EventType, readonly ReplacementEffectReference[]>
>;

export type SpecialHandlerRegistry = Readonly<
  Record<CardId, SpecialHandlerDefinition>
>;

export type ReplacementPrimitiveRegistry = Readonly<
  Record<string, ReplacementPrimitiveDefinition>
>;

export type ContinuousPrimitiveRegistry = Readonly<
  Record<string, ContinuousPrimitiveDefinition>
>;

export interface EffectRegistry {
  effectsByCardId: Readonly<Record<CardId, CardEffectDefinition>>;
  triggeredEffectsByTrigger: TriggerIndex;
  replacementEffectsByEventType: ReplacementIndex;
  specialHandlersByCardId: SpecialHandlerRegistry;
  replacementPrimitivesById: ReplacementPrimitiveRegistry;
  continuousPrimitivesById: ContinuousPrimitiveRegistry;
}
