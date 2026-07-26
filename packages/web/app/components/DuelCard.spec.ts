import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DuelCard from './DuelCard.vue'

describe('DuelCard', () => {
  it('disables native browser dragging on the card image', () => {
    const wrapper = mount(DuelCard, {
      props: {
        src: '/cards/test-card.png',
        alt: 'Test card'
      }
    })

    expect(wrapper.get('img').attributes('draggable')).toBe('false')
  })
})
