import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import DuelCardPickerModal from './DuelCardPickerModal.vue'

describe('DuelCardPickerModal', () => {
  it('renders cards, forwards selection, hover, and close events', async () => {
    const wrapper = mount(DuelCardPickerModal, {
      props: {
        open: true,
        cards: [
          { instanceId: 'card-1', imageUrl: '/cards/1.png', name: 'Card 1' },
          { instanceId: 'card-2', imageUrl: '/cards/2.png', name: 'Card 2' }
        ],
        selectedCardInstanceId: 'card-1',
        modalTestId: 'picker-modal',
        cardTestId: 'picker-card',
        title: 'Titre',
        description: 'Description'
      },
      global: {
        stubs: {
          DuelCard: true,
          Transition: false
        }
      }
    })

    expect(wrapper.get('[data-test="picker-modal"]').text()).toContain('Titre')
    expect(wrapper.get('[data-test="picker-modal"]').text()).toContain('Description')
    expect(wrapper.find('.duel-card-picker-modal-scroll').exists()).toBe(true)
    expect(wrapper.findAll('[data-test="picker-card"]')).toHaveLength(2)

    await wrapper.findAll('[data-test="picker-card"]')[1].trigger('mouseenter')
    await wrapper.findAll('[data-test="picker-card"]')[1].trigger('click')
    await wrapper.get('[data-test="picker-modal"]').trigger('click')

    expect(wrapper.emitted('hover')?.[0]).toEqual([
      { instanceId: 'card-2', imageUrl: '/cards/2.png', name: 'Card 2' }
    ])
    expect(wrapper.emitted('select')?.[0]).toEqual(['card-2'])
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('filters cards through the search field without closing the modal', async () => {
    const wrapper = mount(DuelCardPickerModal, {
      props: {
        open: true,
        cards: [
          { instanceId: 'card-1', imageUrl: '/cards/1.png', name: 'Monkey D. Luffy', number: 'OP01-001' },
          { instanceId: 'card-2', imageUrl: '/cards/2.png', name: 'Kuzan', number: 'OP02-096' }
        ],
        selectedCardInstanceId: 'card-1',
        modalTestId: 'picker-modal',
        cardTestId: 'picker-card',
        showSearch: true,
        searchPlaceholder: 'Rechercher une carte...'
      },
      global: {
        stubs: {
          DuelCard: true,
          Transition: false
        }
      }
    })

    const searchInput = wrapper.get('input[data-test="picker-search-input"]')

    await searchInput.setValue('op02-096')

    expect(wrapper.emitted('update:searchQuery')?.at(-1)).toEqual(['op02-096'])

    await wrapper.setProps({ searchQuery: 'op02-096' })

    expect(wrapper.findAll('[data-test="picker-card"]')).toHaveLength(1)
    expect(wrapper.find('[data-test="picker-empty-state"]').exists()).toBe(false)
  })

  it('closes when the backdrop is clicked or Escape is pressed', async () => {
    const wrapper = mount(DuelCardPickerModal, {
      props: {
        open: true,
        cards: [
          { instanceId: 'card-1', imageUrl: '/cards/1.png', name: 'Card 1' }
        ],
        selectedCardInstanceId: 'card-1',
        modalTestId: 'picker-modal',
        cardTestId: 'picker-card'
      },
      global: {
        stubs: {
          DuelCard: true,
          Transition: false
        }
      }
    })

    await wrapper.get('[data-test="picker-modal"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toHaveLength(2)
  })

  it('does not render when closed', () => {
    const wrapper = mount(DuelCardPickerModal, {
      props: {
        open: false,
        cards: [],
        selectedCardInstanceId: null,
        modalTestId: 'picker-modal',
        cardTestId: 'picker-card'
      },
      global: {
        stubs: {
          DuelCard: true,
          Transition: false
        }
      }
    })

    expect(wrapper.find('[data-test="picker-modal"]').exists()).toBe(false)
  })
})
