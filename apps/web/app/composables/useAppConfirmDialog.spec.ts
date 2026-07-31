import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { useAppConfirmDialog, useAppConfirmDialogHost } from './useAppConfirmDialog'

describe('useAppConfirmDialog', () => {
  beforeEach(() => {
    const host = useAppConfirmDialogHost()

    if (host.open.value) {
      host.cancel()
    }
  })

  it('opens the shared dialog with default labels and resolves true on confirm', async () => {
    const { confirm } = useAppConfirmDialog()
    const host = useAppConfirmDialogHost()

    const pendingConfirmation = confirm({ title: 'Supprimer ce deck ?' })
    await nextTick()

    expect(host.open.value).toBe(true)
    expect(host.options.value).toEqual({
      title: 'Supprimer ce deck ?',
      description: undefined,
      confirmLabel: 'Confirmer',
      cancelLabel: 'Annuler',
      confirmColor: 'error'
    })

    host.confirm()

    await expect(pendingConfirmation).resolves.toBe(true)
    expect(host.open.value).toBe(false)
  })

  it('keeps explicit labels and resolves false on cancel', async () => {
    const { confirm } = useAppConfirmDialog()
    const host = useAppConfirmDialogHost()

    const pendingConfirmation = confirm({
      title: 'Importer ?',
      description: 'Le builder actuel sera remplace.',
      confirmLabel: 'Importer',
      cancelLabel: 'Retour',
      confirmColor: 'primary'
    })
    await nextTick()

    expect(host.options.value).toEqual({
      title: 'Importer ?',
      description: 'Le builder actuel sera remplace.',
      confirmLabel: 'Importer',
      cancelLabel: 'Retour',
      confirmColor: 'primary'
    })

    host.cancel()

    await expect(pendingConfirmation).resolves.toBe(false)
    expect(host.open.value).toBe(false)
  })
})
