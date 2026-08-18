import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CardDetailsPanel from './CardDetailsPanel.vue'

describe('CardDetailsPanel', () => {
  it('renders the full description without a local scrollbar on the text block', () => {
    const wrapper = mount(CardDetailsPanel, {
      props: {
        card: {
          number: 'OP06-092',
          name: 'Kuzan',
          type: 'Character',
          colors: ['Black'],
          imageUrl: '/cards/kuzan.png',
          text: 'Ligne 1\nLigne 2\nLigne 3',
          trigger: null
        },
        rows: [
          ['Cout', 4],
          ['Puissance', 5000]
        ],
        emptyMessage: 'Survolez une carte du plateau.'
      },
      global: {
        renderStubDefaultSlot: true,
        stubs: {
          CardEffectBadges: true,
          UBadge: true,
          UCard: true,
          UIcon: true
        }
      }
    })

    const description = wrapper.get('p.whitespace-pre-line')

    expect(description.text()).toContain('Ligne 1')
    expect(description.text()).toContain('Ligne 2')
    expect(description.text()).toContain('Ligne 3')
    expect(description.classes()).not.toContain('max-h-36')
    expect(description.classes()).not.toContain('overflow-y-auto')
  })
})
