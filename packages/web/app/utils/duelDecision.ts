import type {
  EffectDecisionChoice,
  EffectTargetSelector,
  PendingEffectDecision
} from '@onepiecetcg/shared'

export type DuelCombatDecisionKind = 'block' | 'counter' | 'trigger'

export type DuelCombatDecision = {
  source: 'combat'
  kind: DuelCombatDecisionKind
}

export type DuelEffectDecision = {
  source: 'effect'
  pending: PendingEffectDecision
}

export type DuelUiDecision = DuelCombatDecision | DuelEffectDecision

export type DuelSelectableContext = {
  source: 'combat' | 'effect' | null
  kind: 'none' | 'block' | 'selectCards'
  selector: EffectTargetSelector | null
  selectableCardInstanceIds: string[]
  revealedCardInstanceIds: string[]
}

export type DuelDecisionSubmitState = {
  canSubmit: boolean
  reason: string | null
}

export type DuelEffectChoiceView = EffectDecisionChoice & {
  selected: boolean
}
