import { computed, readonly, shallowRef } from 'vue'

export type AppConfirmDialogOptions = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: 'error' | 'primary'
}

const useAppConfirmDialogState = createGlobalState(() => {
  const options = shallowRef<AppConfirmDialogOptions>({
    title: '',
    description: undefined,
    confirmLabel: 'Confirmer',
    cancelLabel: 'Annuler',
    confirmColor: 'error'
  })
  const {
    isRevealed,
    reveal,
    confirm: confirmDialog,
    cancel: cancelDialog
  } = useConfirmDialog<AppConfirmDialogOptions, boolean, boolean>()

  async function open(nextOptions: AppConfirmDialogOptions): Promise<boolean> {
    options.value = {
      confirmColor: 'error',
      confirmLabel: 'Confirmer',
      cancelLabel: 'Annuler',
      ...nextOptions
    }

    const result = await reveal(options.value)

    return !result.isCanceled && result.data === true
  }

  return {
    isRevealed,
    open,
    options: readonly(options),
    confirmDialog,
    cancelDialog
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
        state.cancelDialog(false)
      }
    }
  })

  function confirm() {
    state.confirmDialog(true)
  }

  function cancel() {
    state.cancelDialog(false)
  }

  return {
    open,
    options: state.options,
    confirm,
    cancel
  }
}
