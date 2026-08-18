import type { DuelPlayerView, PrivateCard, PublicCard } from '@onepiecetcg/shared'
import type { Ref } from 'vue'

export type DuelDebugTriggerType =
  | 'onPlay'
  | 'activateMain'
  | 'activateCounter'
  | 'trigger'
  | 'whenAttacking'
  | 'onAttacked'
  | 'onBlock'
  | 'onKo'
  | 'onBattleKo'
  | 'onDonAttached'
  | 'onDonReturned'
  | 'onCardDrawn'
  | 'onLifeDamageDealt'
  | 'onTurnStart'
  | 'onTurnEnd'
  | 'onCharacterPlayed'

export const duelDebugTriggerOptions: Array<{
  label: string
  value: DuelDebugTriggerType
}> = [
  { label: 'On Play', value: 'onPlay' },
  { label: 'Activate: Main', value: 'activateMain' },
  { label: 'Activate: Counter', value: 'activateCounter' },
  { label: 'Trigger', value: 'trigger' },
  { label: 'When Attacking', value: 'whenAttacking' },
  { label: 'On Attacked', value: 'onAttacked' },
  { label: 'On Block', value: 'onBlock' },
  { label: 'On KO', value: 'onKo' },
  { label: 'On Battle KO', value: 'onBattleKo' },
  { label: 'On Don Attached', value: 'onDonAttached' },
  { label: 'On Don Returned', value: 'onDonReturned' },
  { label: 'On Card Drawn', value: 'onCardDrawn' },
  { label: 'On Life Damage', value: 'onLifeDamageDealt' },
  { label: 'On Turn Start', value: 'onTurnStart' },
  { label: 'On Turn End', value: 'onTurnEnd' },
  { label: 'On Character Played', value: 'onCharacterPlayed' }
]

type UseDuelEffectDebugModalOptions = {
  self: Ref<DuelPlayerView | null>
  queryReferenceCardElement: () => HTMLElement | null
}

/**
 * Specializes the generic card picker modal for the dev-only effect replay
 * tool.
 */
export function useDuelEffectDebugModal(options: UseDuelEffectDebugModalOptions) {
  const effectDebugSearchQuery = ref('')
  const effectDebugTriggerType = ref<DuelDebugTriggerType>('activateMain')
  const picker = useDuelCardPickerModal({
    cards: computed(() => {
      const player = options.self.value

      if (!player) {
        return []
      }

      return [
        player.leader,
        player.stage,
        ...player.characters,
        ...player.hand
      ].filter((card): card is PublicCard | PrivateCard => card !== null)
    }),
    queryReferenceCardElement: options.queryReferenceCardElement
  })

  function resetEffectDebugControls() {
    effectDebugSearchQuery.value = ''
    effectDebugTriggerType.value = 'activateMain'
  }

  function openEffectDebugModal() {
    resetEffectDebugControls()
    picker.openCardPicker()
  }

  function closeEffectDebugModal() {
    resetEffectDebugControls()
    picker.closeCardPicker()
  }

  function toggleEffectDebugModal() {
    if (picker.openedCardPicker.value) {
      closeEffectDebugModal()
      return
    }

    openEffectDebugModal()
  }

  return {
    activeEffectCards: picker.activeCards,
    closeEffectDebugModal,
    effectDebugModalCardSize: picker.pickerCardSize,
    effectDebugSearchQuery,
    effectDebugTriggerType,
    openEffectDebugModal,
    toggleEffectDebugModal,
    openedEffectDebug: picker.openedCardPicker,
    selectedEffectDebugCardInstanceId: picker.selectedCardInstanceId
  }
}
