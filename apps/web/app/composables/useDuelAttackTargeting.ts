import type { Ref } from 'vue'

type CombatSnapshot = {
  attackerSessionId: string
  attackerInstanceId: string
  defenderSessionId: string
  targetType: 'leader' | 'character'
  targetInstanceId?: string
  step?: string
} | null

type ConfirmedAttackArrow = {
  key: number
  fromInstanceId: string
  toInstanceId: string
}

type UseDuelAttackTargetingOptions = {
  combat: Ref<CombatSnapshot>
  canDeclareAttack: Ref<boolean>
  selfSessionId: Ref<string | null>
  selfLeaderInstanceId: Ref<string | null>
  opponentLeaderInstanceId: Ref<string | null>
  targetableOpponentCharacterIds: Ref<string[]>
  onDeclareLeaderAttack: (attackerInstanceId: string) => void
  onDeclareCharacterAttack: (attackerInstanceId: string, targetInstanceId: string) => void
  onInvalidTarget: (targetInstanceId: string) => void
}

/**
 * Tracks local attack drag state and confirmed server-side combat arrows for the duel board.
 */
export function useDuelAttackTargeting(options: UseDuelAttackTargetingOptions) {
  const pointerPosition = ref<{ x: number, y: number } | null>(null)
  const pendingAttackerInstanceId = ref<string | null>(null)
  const declaredAttackTargetInstanceId = ref<string | null>(null)
  const confirmedAttackArrow = ref<ConfirmedAttackArrow | null>(null)
  const lastConfirmedAttackArrowSignature = ref<string | null>(null)
  const isChoosingTarget = computed(() => pendingAttackerInstanceId.value !== null)
  let confirmedAttackArrowKey = 0

  const attackArrowFromInstanceId = computed(() => {
    if (pendingAttackerInstanceId.value) {
      return pendingAttackerInstanceId.value
    }

    return confirmedAttackArrow.value?.fromInstanceId ?? null
  })

  const attackArrowToInstanceId = computed(() =>
    pendingAttackerInstanceId.value
      ? declaredAttackTargetInstanceId.value
      : confirmedAttackArrow.value?.toInstanceId ?? null
  )

  const attackArrowToPoint = computed(() =>
    isChoosingTarget.value && !declaredAttackTargetInstanceId.value ? pointerPosition.value : null
  )

  const shouldRenderAttackArrow = computed(() =>
    Boolean(
      attackArrowFromInstanceId.value
      && (attackArrowToInstanceId.value || attackArrowToPoint.value)
    )
  )

  function onBoardPointerMove(event: PointerEvent) {
    pointerPosition.value = { x: event.clientX, y: event.clientY }
  }

  function beginAttackDrag(instanceId: string) {
    if (!options.canDeclareAttack.value) {
      return
    }

    pendingAttackerInstanceId.value = instanceId
    declaredAttackTargetInstanceId.value = null
  }

  function resolveCombatTargetInstanceId() {
    if (!options.combat.value) {
      return null
    }

    if (options.combat.value.targetType === 'character') {
      return options.combat.value.targetInstanceId ?? null
    }

    return options.combat.value.defenderSessionId === options.selfSessionId.value
      ? options.selfLeaderInstanceId.value
      : options.opponentLeaderInstanceId.value
  }

  function hasResolvedCombatAttackerAndTarget() {
    if (!options.combat.value) {
      return false
    }

    return options.combat.value.attackerInstanceId.length > 0 && resolveCombatTargetInstanceId() !== null
  }

  function resolveConfirmedAttackArrowSignature() {
    const targetInstanceId = resolveCombatTargetInstanceId()

    if (!options.combat.value || !targetInstanceId || options.combat.value.attackerInstanceId.length === 0) {
      return null
    }

    return [
      options.combat.value.attackerSessionId,
      options.combat.value.attackerInstanceId,
      options.combat.value.defenderSessionId,
      options.combat.value.targetType,
      targetInstanceId
    ].join(':')
  }

  function showConfirmedAttackArrow(fromInstanceId: string, toInstanceId: string) {
    confirmedAttackArrow.value = {
      key: ++confirmedAttackArrowKey,
      fromInstanceId,
      toInstanceId
    }
  }

  function cancelTargetSelection() {
    pendingAttackerInstanceId.value = null
    declaredAttackTargetInstanceId.value = null
  }

  function confirmLeaderTarget() {
    if (!isChoosingTarget.value || !pendingAttackerInstanceId.value) {
      return
    }

    options.onDeclareLeaderAttack(pendingAttackerInstanceId.value)
    pendingAttackerInstanceId.value = null
  }

  function confirmCharacterTarget(instanceId: string) {
    if (!isChoosingTarget.value || !pendingAttackerInstanceId.value) {
      return
    }

    if (!options.targetableOpponentCharacterIds.value.includes(instanceId)) {
      options.onInvalidTarget(instanceId)
      return
    }

    options.onDeclareCharacterAttack(pendingAttackerInstanceId.value, instanceId)
    pendingAttackerInstanceId.value = null
  }

  function resolveAttackDropTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
      return null
    }

    const cardElement = target.closest<HTMLElement>('[data-instance-id][data-zone-side]')

    if (!cardElement) {
      return null
    }

    return {
      instanceId: cardElement.dataset.instanceId ?? null,
      side: Number(cardElement.dataset.zoneSide)
    }
  }

  function finishAttackDrag(event: PointerEvent) {
    if (!isChoosingTarget.value || !pendingAttackerInstanceId.value) {
      return
    }

    if (event.button === 2) {
      cancelTargetSelection()
      return
    }

    const pointerTarget = document.elementFromPoint(event.clientX, event.clientY) ?? event.target
    const dropTarget = resolveAttackDropTarget(pointerTarget)

    if (!dropTarget || dropTarget.side !== 1 || !dropTarget.instanceId) {
      cancelTargetSelection()
      return
    }

    if (dropTarget.instanceId === options.opponentLeaderInstanceId.value) {
      confirmLeaderTarget()
      return
    }

    if (!options.targetableOpponentCharacterIds.value.includes(dropTarget.instanceId)) {
      options.onInvalidTarget(dropTarget.instanceId)
      cancelTargetSelection()
      return
    }

    confirmCharacterTarget(dropTarget.instanceId)
  }

  watch(
    [
      () => options.combat.value?.step,
      () => options.combat.value?.attackerInstanceId,
      () => options.combat.value?.targetType,
      () => options.combat.value?.targetInstanceId,
      () => options.combat.value?.defenderSessionId,
      () => options.selfLeaderInstanceId.value,
      () => options.opponentLeaderInstanceId.value
    ],
    ([step, attackerInstanceId]) => {
      if (options.combat.value && attackerInstanceId && hasResolvedCombatAttackerAndTarget()) {
        const targetInstanceId = resolveCombatTargetInstanceId()
        const signature = resolveConfirmedAttackArrowSignature()

        declaredAttackTargetInstanceId.value = targetInstanceId

        if (
          targetInstanceId
          && signature
          && signature !== lastConfirmedAttackArrowSignature.value
        ) {
          lastConfirmedAttackArrowSignature.value = signature
          showConfirmedAttackArrow(attackerInstanceId, targetInstanceId)
        }

        return
      }

      if (!pendingAttackerInstanceId.value) {
        declaredAttackTargetInstanceId.value = null
      }

      if (!attackerInstanceId) {
        confirmedAttackArrow.value = null
      }

      if (!step || !attackerInstanceId) {
        lastConfirmedAttackArrowSignature.value = null
      }
    },
    { immediate: true }
  )

  useEventListener(document, 'pointerup', (event) => {
    finishAttackDrag(event)
  })

  useEventListener(document, 'contextmenu', (event) => {
    if (!isChoosingTarget.value) {
      return
    }

    event.preventDefault()
    cancelTargetSelection()
  })

  return {
    pendingAttackerInstanceId,
    confirmedAttackArrow,
    isChoosingTarget,
    attackArrowFromInstanceId,
    attackArrowToInstanceId,
    attackArrowToPoint,
    shouldRenderAttackArrow,
    onBoardPointerMove,
    beginAttackDrag,
    cancelTargetSelection,
    confirmLeaderTarget,
    confirmCharacterTarget
  }
}
