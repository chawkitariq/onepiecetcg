import AppConfirmDialog from '~/components/AppConfirmDialog.vue'

export type ConfirmDialogOptions = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: 'error' | 'primary' | 'warning'
}

/**
 * Opens the app-wide confirmation dialog through Nuxt UI's overlay system.
 */
export function useConfirmDialog() {
  const overlay = useOverlay()
  const dialog = overlay.create(AppConfirmDialog)

  async function confirm(options: ConfirmDialogOptions): Promise<boolean> {
    const instance = dialog.open({
      confirmColor: 'error',
      confirmLabel: 'Confirmer',
      cancelLabel: 'Annuler',
      ...options
    })

    return await instance.result
  }

  return {
    confirm
  }
}
