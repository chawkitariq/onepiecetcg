import { computed, readonly, shallowRef } from 'vue'

export type AppConfirmDialogOptions = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: 'error' | 'primary' | 'warning'
}

const useAppConfirmDialogState = createGlobalState(() => {
  const options = shallowRef<AppConfirmDialogOptions>({
    title: '',
    description: undefined,
    confirmLabel: 'Confirmer',
    cancelLabel: 'Annuler',
    confirmColor: 'error'
  })
  const isRevealed = ref(false)
  const pendingResolve = shallowRef<((confirmed: boolean) => void) | null>(null)

  async function open(nextOptions: AppConfirmDialogOptions): Promise<boolean> {
    options.value = {
      confirmColor: 'error',
      confirmLabel: 'Confirmer',
      cancelLabel: 'Annuler',
      ...nextOptions
    }

    isRevealed.value = true

    return await new Promise<boolean>((resolve) => {
      pendingResolve.value = resolve
    })
  }

  function settle(confirmed: boolean) {
    if (!pendingResolve.value) {
      isRevealed.value = false
      return
    }

    const resolve = pendingResolve.value
    pendingResolve.value = null
    isRevealed.value = false
    resolve(confirmed)
  }

  return {
    isRevealed,
    open,
    options: readonly(options),
    confirmDialog: () => settle(true),
    cancelDialog: () => settle(false)
  }
})

/**
 * Opens the app-wide confirmation dialog and resolves to the user's choice.
 */
export function useAppConfirmDialog() {
  const state = useAppConfirmDialogState()

  return {
    confirm: state.open
  }
}

/**
 * Exposes the shared dialog state for the single global dialog host component.
 */
export function useAppConfirmDialogHost() {
  const state = useAppConfirmDialogState()
  const open = computed({
    get: () => state.isRevealed.value,
    set: (value: boolean) => {
      if (!value) {
        state.cancelDialog()
      }
    }
  })

  function confirm() {
    state.confirmDialog()
  }

  function cancel() {
    state.cancelDialog()
  }

  return {
    open,
    options: state.options,
    confirm,
    cancel
  }
}
