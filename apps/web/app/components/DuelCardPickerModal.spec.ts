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
