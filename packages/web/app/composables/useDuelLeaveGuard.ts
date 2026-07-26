import type { ComputedRef, Ref } from 'vue'
import type { ConfirmDialogOptions } from './useConfirmDialog'
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

type DuelLeaveGuardOptions = {
  enabled: Ref<boolean> | ComputedRef<boolean>
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>
  leave: () => Promise<void>
  dialog?: ConfirmDialogOptions
}

const DEFAULT_DIALOG_OPTIONS: ConfirmDialogOptions = {
  title: 'Retourner au lobby ?',
  description: 'Vous quitterez la partie en cours.',
  confirmLabel: 'Retourner au lobby'
}

/**
 * Guards an in-progress duel against accidental navigation away from the page.
 *
 * Internal route changes reuse the app's confirm dialog so the player can back
 * out of a misclick, while browser-level exits (refresh, tab close, address-bar
 * navigation) use the native `beforeunload` prompt that browsers still allow.
 */
export function useDuelLeaveGuard(options: DuelLeaveGuardOptions) {
  const isEnabled = computed(() => options.enabled.value)
  const dialogOptions = computed<ConfirmDialogOptions>(() => ({
    ...DEFAULT_DIALOG_OPTIONS,
    ...options.dialog
  }))

  function handleBeforeUnload(event: BeforeUnloadEvent) {
    if (!isEnabled.value) {
      return
    }

    event.preventDefault()
    event.returnValue = ''
  }

  async function confirmLeave() {
    if (!isEnabled.value) {
      return true
    }

    return await options.confirm(dialogOptions.value)
  }

  async function leaveWithConfirmation() {
    const confirmed = await confirmLeave()

    if (!confirmed) {
      return false
    }

    await options.leave()

    return true
  }

  onBeforeRouteLeave(async () => {
    if (!isEnabled.value) {
      return
    }

    const confirmed = await confirmLeave()

    if (!confirmed) {
      return false
    }

    await options.leave()
  })

  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  return {
    confirmLeave,
    leaveWithConfirmation
  }
}
