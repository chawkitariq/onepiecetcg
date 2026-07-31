import type {
  CardEffectDefinition,
  ContinuousEffectDefinition,
  EffectSourceBundle,
  EffectTriggerType,
  ReplacementEffectDefinition,
  SpecialHandlerDefinition,
  StandardEffectDefinition,
} from '@onepiecetcg/shared';

export type CardId = string;

export type TriggerType = EffectTriggerType;

export type EventType = ReplacementEffectDefinition['event'];

export type EffectDefinition = CardEffectDefinition;

export type StandardEffect = StandardEffectDefinition;

export type ReplacementEffect = ReplacementEffectDefinition;

export type ContinuousEffect = ContinuousEffectDefinition;

export type { EffectSourceBundle, SpecialHandlerDefinition };

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

export interface EffectRegistry {
  effectsByCardId: Readonly<Record<CardId, CardEffectDefinition>>;
  triggeredEffectsByTrigger: TriggerIndex;
  replacementEffectsByEventType: ReplacementIndex;
  specialHandlersByCardId: SpecialHandlerRegistry;
}
