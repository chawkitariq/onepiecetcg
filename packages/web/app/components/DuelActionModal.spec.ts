import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import DuelActionModal from './DuelActionModal.vue'

describe('DuelActionModal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders above the attack arrow overlay', async () => {
    mount(DuelActionModal, {
      attachTo: document.body,
      props: {
        state: {
          tone: 'danger',
          title: 'Action impossible',
          description: 'Un combat est en cours.',
          actions: [
            {
              label: 'Compris',
              onSelect: () => {}
            }
          ]
        }
      }
    })

    const overlay = document.body.querySelector('.fixed.inset-0.z-\\[150\\]')

    expect(overlay).not.toBeNull()
  })
})
