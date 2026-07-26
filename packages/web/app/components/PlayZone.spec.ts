import type { DuelPlayerView, PrivateCard, PublicCard } from '@onepiecetcg/shared'
import { mount } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { defineComponent, h, nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PlayZone from './PlayZone.vue'

const reducedMotion = ref<'reduce' | 'no-preference'>('no-preference')
const tooltipStub = defineComponent({
  name: 'UTooltip',
  setup(_, { slots }) {
    return () => h('div', { 'data-tooltip-stub': 'true' }, slots.default?.())
  }
})
const popoverStub = defineComponent({
  name: 'UPopover',
  props: {
    open: { type: Boolean, default: false },
    reference: { type: null, default: null }
  },
  setup(props, { slots }) {
    return () => h('div', {
      'data-popover-stub': 'true',
      'data-open': String(props.open),
      'data-has-reference': String(Boolean(props.reference))
    }, [
      h('div', { 'data-popover-content': String(props.open) }, slots.content?.({ close: () => undefined }))
    ])
  }
})

function popoverTestStubs() {
  return {
    UTooltip: tooltipStub,
    UPopover: popoverStub,
    UButton: defineComponent({
      name: 'UButton',
      inheritAttrs: false,
      props: {
        disabled: { type: Boolean, default: false }
      },
      setup(props, { slots, attrs }) {
        return () => h('button', { ...attrs, disabled: props.disabled }, slots.default?.())
      }
    }),
    UIcon: defineComponent({
      name: 'UIcon',
      props: {
        name: { type: String, required: true }
      },
      setup(props) {
        return () => h('span', { 'data-icon-name': props.name })
      }
    })
  }
}

mockNuxtImport('usePreferredReducedMotion', () => () => reducedMotion)

function createPublicCard(instanceId: string, overrides: Partial<PublicCard> = {}): PublicCard {
  return {
    instanceId,
    cardId: instanceId,
    number: instanceId,
    name: instanceId,
    type: 'Character',
    colors: ['Red'],
    cost: 1,
    power: 1000,
    life: null,
    counter: 1000,
    imageUrl: `/cards/${instanceId}.png`,
    rested: false,
    attachedDon: 0,
    playedThisTurn: false,
    ...overrides
  }
}

function createPrivateCard(instanceId: string): PrivateCard {
  return {
    ...createPublicCard(instanceId),
    text: '',
    trigger: null
  }
}

function extractDirectionalOffset(style: string, direction: 'left' | 'right') {
  const match = style.match(new RegExp(`${direction}:\\s*(-?[0-9.]+)%`))

  return match ? Number.parseFloat(match[1] ?? '0') : null
}

function createPlayer(overrides: Partial<DuelPlayerView> = {}): DuelPlayerView {
  return {
    sessionId: 'player-a',
    displayName: 'Player A',
    deckId: 'deck-a',
    ready: true,
    connected: true,
    mulliganDecided: true,
    hasTakenFirstTurn: true,
    leader: createPublicCard('leader-a', { type: 'Leader', power: 5000 }),
    stage: null,
    characters: [createPublicCard('character-a')],
    cost: [],
    trash: [],
    donDeckCount: 10,
    hand: [createPrivateCard('hand-a')],
    handCount: 1,
    deck: [createPrivateCard('deck-a')],
    deckCount: 30,
    life: [createPrivateCard('life-a')],
    lifeCount: 4,
    ...overrides
  }
}

describe('PlayZone transitions', () => {
  beforeEach(() => {
    reducedMotion.value = 'no-preference'
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      disconnect() {}
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps leader overflow visible so a rested leader can fully extend outside the slot', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          leader: createPublicCard('leader-a', {
            type: 'Leader',
            power: 5000,
            rested: true
          })
        }),
        side: 0
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const leaderZone = wrapper.findAllComponents({ name: 'DuelZoneSlot' })
      .find(component => component.props('label') === 'Leader')

    expect(leaderZone?.props('allowOverflow')).toBe(true)
  })

  it('keeps deck overflow visible so draw transitions can travel between zones', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer(),
        side: 0
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const zones = wrapper.findAllComponents({ name: 'DuelZoneSlot' })
    const deckZone = zones.find(component => component.props('label') === 'Deck')
    expect(deckZone?.props('allowOverflow')).toBe(true)
    expect(wrapper.html()).toContain('overflow-visible')
  })

  it('tags the DON!! deck container, not the Life stack, for DON!!-to-Cost travel source lookup', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer(),
        side: 0
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const taggedContainers = wrapper.findAll('[data-don-deck-side="0"]')
    const taggedMarkup = taggedContainers.map(node => node.html()).join('\n')

    expect(taggedContainers).toHaveLength(1)
    expect(taggedMarkup).toContain('Deck DON!!')
    expect(taggedMarkup).not.toContain('alt="Vie"')
  })

  it('does not render a Main zone -- the hand lives in DuelHand, not on the mirrored board', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer(),
        side: 0
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const zones = wrapper.findAllComponents({ name: 'DuelZoneSlot' })
    expect(zones.some(component => component.props('label') === 'Main')).toBe(false)
  })

  it('renders ghosts for hidden-zone transitions from life, deck and DON!! deck', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer(),
        side: 0,
        transitionGhosts: [
          { instanceId: 'life-ghost', source: 'life' },
          { instanceId: 'deck-ghost', source: 'deck' },
          { instanceId: 'don-ghost', source: 'donDeck' }
        ]
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const ghostIds = wrapper.findAll('[data-layout-id]')
      .map(node => node.attributes('data-layout-id'))

    expect(ghostIds).toEqual(expect.arrayContaining(['life-ghost', 'deck-ghost', 'don-ghost']))
  })

  it('keeps custom layout classes on hidden-zone ghosts and board destinations', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          stage: createPublicCard('stage-a', { type: 'Stage', power: null, counter: null })
        }),
        side: 0,
        transitionGhosts: [{ instanceId: 'deck-ghost', source: 'deck' }]
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    expect(wrapper.find('[data-layout-id="deck-ghost"]').classes()).toContain('duel-zone-ghost')
    expect(wrapper.find('[data-layout-id="character-a"]').classes()).toContain('duel-layout-card')
    expect(wrapper.find('[data-layout-id="stage-a"]').classes()).toContain('duel-layout-card')
  })

  it('anchors character action popovers to the animated character card node', async () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          characters: [createPublicCard('character-a')]
        }),
        side: 0,
        characterActionPopoverItems: {
          'character-a': [{ label: 'Attacher un DON!!', onSelect: vi.fn() }]
        }
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    await nextTick()

    expect(wrapper.find('[data-layout-id="character-a"]').exists()).toBe(true)
    expect(wrapper.get('[data-popover-stub="true"]').attributes('data-has-reference')).toBe('true')
  })

  it('keeps deferred board cards hidden and out of shared-layout travel until the overlay completes', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          characters: [createPublicCard('character-a')],
          stage: createPublicCard('stage-a', { type: 'Stage', power: null, counter: null })
        }),
        side: 0,
        deferredBoardCardIds: ['character-a', 'stage-a']
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const deferredCharacter = wrapper.get('[data-instance-id="character-a"]')
    const deferredStage = wrapper.get('[data-instance-id="stage-a"]')

    expect(deferredCharacter.classes()).toContain('opacity-0')
    expect(deferredStage.classes()).toContain('opacity-0')
    expect(deferredCharacter.attributes('data-layout-id')).toBeUndefined()
    expect(deferredStage.attributes('data-layout-id')).toBeUndefined()
  })

  it('keeps deferred cost cards hidden and out of shared-layout travel until the DON!! overlay completes', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          cost: [
            createPublicCard('don-ready-1', { type: 'DON!!', cost: null, power: null, counter: null }),
            createPublicCard('don-ready-2', { type: 'DON!!', cost: null, power: null, counter: null })
          ]
        }),
        side: 0,
        deferredCostCardIds: ['don-ready-2']
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const deferredCostCard = wrapper.get('[data-instance-id="don-ready-2"]')

    expect(deferredCostCard.classes()).toContain('opacity-0')
    expect(deferredCostCard.attributes('data-layout-id')).toBeUndefined()
  })

  it('keeps a deferred trash arrival hidden and out of shared-layout travel until the trash overlay completes', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          trash: [createPublicCard('trash-top')]
        }),
        side: 0,
        deferredTrashCardIds: ['trash-top']
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const deferredTrashCard = wrapper.get('[data-instance-id="trash-top"]')

    expect(deferredTrashCard.classes()).toContain('opacity-0')
    expect(deferredTrashCard.attributes('data-layout-id')).toBeUndefined()
  })

  it('renders untapped and rested DON!! as two opposite cost stacks', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          cost: [
            createPublicCard('don-ready-1', { type: 'DON!!', cost: null, power: null, counter: null }),
            createPublicCard('don-ready-2', { type: 'DON!!', cost: null, power: null, counter: null }),
            createPublicCard('don-rested-1', { type: 'DON!!', cost: null, power: null, counter: null, rested: true }),
            createPublicCard('don-rested-2', { type: 'DON!!', cost: null, power: null, counter: null, rested: true })
          ]
        }),
        side: 0
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const zones = wrapper.findAllComponents({ name: 'DuelZoneSlot' })
    const costZone = zones.find(component => component.props('label') === 'Cost')
    const untappedCards = wrapper.findAll('[data-cost-state="untapped"]')
    const restedCards = wrapper.findAll('[data-cost-state="rested"]')

    expect(costZone?.props('allowOverflow')).toBe(true)
    expect(wrapper.find('[data-cost-stack="untapped"]').exists()).toBe(true)
    expect(wrapper.find('[data-cost-stack="rested"]').exists()).toBe(true)
    expect(untappedCards).toHaveLength(2)
    expect(restedCards).toHaveLength(2)
    const untappedFirstOffset = extractDirectionalOffset(untappedCards[0]?.attributes('style') ?? '', 'left')
    const untappedSecondOffset = extractDirectionalOffset(untappedCards[1]?.attributes('style') ?? '', 'left')
    const restedFirstOffset = extractDirectionalOffset(restedCards[0]?.attributes('style') ?? '', 'right')
    const restedSecondOffset = extractDirectionalOffset(restedCards[1]?.attributes('style') ?? '', 'right')

    expect(untappedFirstOffset).not.toBeNull()
    expect(untappedSecondOffset).not.toBeNull()
    expect(restedFirstOffset).not.toBeNull()
    expect(restedSecondOffset).not.toBeNull()
    expect(untappedFirstOffset).not.toBe(untappedSecondOffset)
    expect(restedFirstOffset).not.toBe(restedSecondOffset)
    expect(untappedSecondOffset).toBeGreaterThan(untappedFirstOffset ?? 0)
    expect(restedSecondOffset).toBeGreaterThan(restedFirstOffset ?? 0)
  })

  it('renders attached DON!! cards below a character and the leader', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          leader: createPublicCard('leader-a', { type: 'Leader', power: 5000, attachedDon: 1 }),
          characters: [
            createPublicCard('character-a', { attachedDon: 2 })
          ]
        }),
        side: 0
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const characterAnchor = wrapper.get('[data-attached-don-anchor="character-a"]')
    const leaderAnchor = wrapper.get('[data-attached-don-anchor="leader-a"]')

    expect(characterAnchor.findAll('img[alt="DON!! attache"]')).toHaveLength(2)
    expect(leaderAnchor.findAll('img[alt="DON!! attache"]')).toHaveLength(1)
  })

  it('widens the attached DON!! anchor as the stack grows so later cards keep the same size', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          characters: [
            createPublicCard('character-a', { attachedDon: 5 })
          ]
        }),
        side: 0
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const characterAnchor = wrapper.get('[data-attached-don-anchor="character-a"]')

    expect(characterAnchor.attributes('style')).toContain('calc(58% + 56px)')
    expect(characterAnchor.findAll('img[alt="DON!! attache"]')).toHaveLength(5)
  })

  it('emits a drop event when a dragged hand card is released over the character zone', async () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer(),
        side: 0,
        draggedHandCardInstanceId: 'hand-a',
        canDropOnCharacterZone: true
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const characterZone = wrapper.get('[data-drop-zone="character"]')

    await characterZone.trigger('dragenter')
    await characterZone.trigger('dragover', {
      dataTransfer: {
        dropEffect: 'none'
      }
    })
    await characterZone.trigger('drop')

    expect(wrapper.emitted('handCardDropOnCharacters')).toEqual([[0]])
  })

  it('emits a drop event when a dragged hand card is released over the stage zone', async () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer(),
        side: 0,
        draggedHandCardInstanceId: 'hand-a',
        canDropOnStageZone: true
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const stageZoneButton = wrapper.get('[data-drop-zone="stage"]')

    await stageZoneButton.trigger('dragenter')
    await stageZoneButton.trigger('dragover', { dataTransfer: { dropEffect: '' } })
    await stageZoneButton.trigger('drop')

    expect(wrapper.emitted('handCardDropOnStage')).toEqual([[0]])
  })

  it('starts DON!! selection on shift-mousedown', async () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          cost: [
            createPublicCard('don-ready-1', { type: 'DON!!', cost: null, power: null, counter: null })
          ]
        }),
        side: 0
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    await wrapper.get('[data-cost-state="untapped"]').trigger('mousedown', {
      shiftKey: true
    })

    expect(wrapper.emitted('donCardSelectionStart')).toEqual([['don-ready-1']])
  })

  it('extends DON!! selection on shift-hover', async () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          cost: [
            createPublicCard('don-ready-1', { type: 'DON!!', cost: null, power: null, counter: null }),
            createPublicCard('don-ready-2', { type: 'DON!!', cost: null, power: null, counter: null })
          ]
        }),
        side: 0
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    await wrapper.findAll('[data-cost-state="untapped"]')[1]!.trigger('mouseenter', {
      shiftKey: true
    })

    expect(wrapper.emitted('donCardSelectionHover')).toEqual([['don-ready-2']])
  })

  it('does not start DON!! selection on ctrl-click anymore', async () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          cost: [
            createPublicCard('don-ready-1', { type: 'DON!!', cost: null, power: null, counter: null })
          ]
        }),
        side: 0
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    await wrapper.get('[data-cost-state="untapped"]').trigger('click', {
      ctrlKey: true
    })

    expect(wrapper.emitted('donCardSelectionStart')).toBeUndefined()
    expect(wrapper.emitted('donCardSelectionHover')).toBeUndefined()
  })

  it('marks selected untapped DON!! cards and emits a drag drop attach on the leader', async () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          cost: [
            createPublicCard('don-ready-1', { type: 'DON!!', cost: null, power: null, counter: null })
          ]
        }),
        side: 0,
        selectedDonCardIds: ['don-ready-1'],
        draggedDonCardInstanceId: 'don-ready-1',
        draggedDonCardCount: 2,
        canDropDonOnLeader: true
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const donCard = wrapper.get('[data-cost-state="untapped"]')
    const leaderButton = wrapper.get('[data-instance-id="leader-a"]')

    expect(donCard.attributes('data-don-selected')).toBe('true')

    await leaderButton.trigger('dragenter')
    await leaderButton.trigger('dragover', { dataTransfer: { dropEffect: '' } })
    await leaderButton.trigger('drop')

    expect(wrapper.emitted('donCardDropOnLeader')).toEqual([[0]])
  })

  it('shows a count badge for multi-card DON!! selections', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          cost: [
            createPublicCard('don-ready-1', { type: 'DON!!', cost: null, power: null, counter: null }),
            createPublicCard('don-ready-2', { type: 'DON!!', cost: null, power: null, counter: null }),
            createPublicCard('don-ready-3', { type: 'DON!!', cost: null, power: null, counter: null })
          ]
        }),
        side: 0,
        selectedDonCardIds: ['don-ready-1', 'don-ready-2', 'don-ready-3']
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const badge = wrapper.get('[data-selected-don-count]')

    expect(badge.text()).toBe('3')
    expect(badge.attributes('title')).toContain('3 DON!!')
  })

  it('switches the open popover to another character on the first click', async () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          characters: [
            createPublicCard('character-a'),
            createPublicCard('character-b')
          ]
        }),
        side: 0,
        characterActionPopoverItems: {
          'character-a': [{ label: 'Attacher un DON!!', onSelect: vi.fn() }],
          'character-b': [{ label: 'Attacher un DON!!', onSelect: vi.fn() }]
        }
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const characterButtons = wrapper.findAll('[data-instance-id="character-a"], [data-instance-id="character-b"]')

    await characterButtons[0]!.trigger('click')
    expect(wrapper.findAll('[data-popover-stub="true"]').map(node => node.attributes('data-open'))).toEqual(['true', 'false'])

    await characterButtons[1]!.trigger('click')
    expect(wrapper.findAll('[data-popover-stub="true"]').map(node => node.attributes('data-open'))).toEqual(['false', 'true'])
  })

  it('switches the open popover from the leader to a character on the first click', async () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          characters: [createPublicCard('character-a')]
        }),
        side: 0,
        leaderActionPopoverItems: [{ label: 'Attaquer avec', onSelect: vi.fn() }],
        characterActionPopoverItems: {
          'character-a': [{ label: 'Attacher un DON!!', onSelect: vi.fn() }]
        }
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const leaderButton = wrapper.get('[data-instance-id="leader-a"]')
    const characterButton = wrapper.get('[data-instance-id="character-a"]')

    await leaderButton.trigger('click')
    expect(wrapper.findAll('[data-popover-stub="true"]').map(node => node.attributes('data-open'))).toEqual(['false', 'true'])

    await characterButton.trigger('click')
    expect(wrapper.findAll('[data-popover-stub="true"]').map(node => node.attributes('data-open'))).toEqual(['true', 'false'])
  })
})
