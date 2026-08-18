import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PublicCard } from '@onepiecetcg/shared'
import DuelDecisionCardOrderPicker from './DuelDecisionCardOrderPicker.vue'

const useSortableMock = vi.hoisted(() => vi.fn())

vi.mock('@vueuse/integrations/useSortable', () => ({
  useSortable: useSortableMock,
}))

describe('DuelDecisionCardOrderPicker', () => {
  afterEach(() => {
    useSortableMock.mockReset()
  })

  function createPublicCard(instanceId: string): PublicCard {
    return {
      instanceId,
      cardId: instanceId,
      number: instanceId,
      name: `Card ${instanceId}`,
      type: 'Character',
      colors: ['Red'],
      cost: 1,
      power: 1000,
      life: null,
      counter: 1000,
      attributes: [],
      families: [],
      imageUrl: `/cards/${instanceId}.png`,
      rested: false,
      attachedDon: 0,
      playedThisTurn: false,
      hasRush: false,
      hasDoubleAttack: false,
      hasBanish: false,
      canAttackActiveCharacters: false,
      mustBeAttackTarget: false,
      cannotAttack: false,
      cannotAttackLeaderOnTurnPlayed: false,
      cannotBlock: false,
      cannotBeKoedInBattle: false,
      cannotBeKoedByEffects: false,
      cannotBeKoedBySlashInBattle: false,
      cannotBeKoedByStrikeInBattle: false,
      winOnDeckOut: false,
      cannotAttackUntilTurn: 0,
      skipNextRefreshPhases: 0,
    }
  }

  it('renders ordered cards and emits the reordered list when the sortable array changes', async () => {
    const option = vi.fn()
    useSortableMock.mockReturnValue({
      option,
      start: vi.fn(),
      stop: vi.fn(),
    })

    const wrapper = mount(DuelDecisionCardOrderPicker, {
      props: {
        cards: [createPublicCard('card-1'), createPublicCard('card-2')],
        message: 'Réordonnez les cartes',
      },
      global: {
        stubs: {
          DuelCard: true,
          UScrollArea: { template: '<div><slot /></div>' },
          UIcon: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Réordonnez les cartes')
    expect(wrapper.text()).toContain('Position 1')
    expect(wrapper.text()).toContain('Position 2')
    expect(useSortableMock).toHaveBeenCalledTimes(1)

    const sortableCards = useSortableMock.mock.calls[0]?.[1]
    expect(sortableCards?.value.map((card: { instanceId: string }) => card.instanceId)).toEqual([
      'card-1',
      'card-2',
    ])

    sortableCards.value = [...sortableCards.value].reverse()
    await nextTick()

    expect(wrapper.emitted('update:cards')?.at(-1)?.[0]).toEqual([
      expect.objectContaining({ instanceId: 'card-2' }),
      expect.objectContaining({ instanceId: 'card-1' }),
    ])
  })
})
