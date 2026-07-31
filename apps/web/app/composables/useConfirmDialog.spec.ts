import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useConfirmDialog } from './useConfirmDialog'

const { open, create, useOverlayMock } = vi.hoisted(() => {
  const open = vi.fn()
  const create = vi.fn(() => ({ open }))
  const useOverlayMock = vi.fn(() => ({ create }))

  return { open, create, useOverlayMock }
})

mockNuxtImport('useOverlay', () => useOverlayMock)

describe('useConfirmDialog', () => {
  beforeEach(() => {
    open.mockReset()
    create.mockClear()
    useOverlayMock.mockClear()
  })

  it('opens the global confirm dialog with default labels and color', async () => {
    open.mockReturnValue({ result: Promise.resolve(true) })

    const { confirm } = useConfirmDialog()
    const result = await confirm({ title: 'Supprimer ce deck ?' })

    expect(useOverlayMock).toHaveBeenCalled()
    expect(create).toHaveBeenCalledTimes(1)
    expect(open).toHaveBeenCalledWith({
      title: 'Supprimer ce deck ?',
      confirmColor: 'error',
      confirmLabel: 'Confirmer',
      cancelLabel: 'Annuler'
    })
    expect(result).toBe(true)
  })

  it('preserves explicit dialog labels and color overrides', async () => {
    open.mockReturnValue({ result: Promise.resolve(false) })

    const { confirm } = useConfirmDialog()
    const result = await confirm({
      title: 'Importer ?',
      description: 'Le builder actuel sera remplace.',
      confirmLabel: 'Importer',
      cancelLabel: 'Retour',
      confirmColor: 'primary'
    })

    expect(open).toHaveBeenCalledWith({
      title: 'Importer ?',
      description: 'Le builder actuel sera remplace.',
      confirmColor: 'primary',
      confirmLabel: 'Importer',
      cancelLabel: 'Retour'
    })
    expect(result).toBe(false)
  })
})
