import type { DuelPlayerView, PrivateCard, PublicCard } from '@onepiecetcg/shared'
import { mount } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { defineComponent, h, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AnimatedPowerBadge from './AnimatedPowerBadge.vue'
import PlayZone from './PlayZone.vue'

const reducedMotion = ref<'reduce' | 'no-preference'>('no-preference')
const tooltipStub = defineComponent({
  name: 'UTooltip',
  setup(_, { slots }) {
    return () => h('div', { 'data-tooltip-stub': 'true' }, slots.default?.())
  }
})
function zoneTestStubs() {
  return {
    UTooltip: tooltipStub
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

function extractTranslateX(style: string) {
  const match = style.match(/translateX\((-?[0-9.]+)px\)/)

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
        stubs: zoneTestStubs()
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
        stubs: zoneTestStubs()
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
        stubs: zoneTestStubs()
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
        stubs: zoneTestStubs()
      }
    })

    const zones = wrapper.findAllComponents({ name: 'DuelZoneSlot' })
    expect(zones.some(component => component.props('label') === 'Main')).toBe(false)
  })

  it('applies the shared targetable highlight class to a valid character target', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          characters: [createPublicCard('character-a', { rested: true })]
        }),
        side: 0,
        targetableCharacterIds: ['character-a']
      },
      global: {
        stubs: zoneTestStubs()
      }
    })

    const characterButton = wrapper.get('[data-instance-id="character-a"]')

    expect(characterButton.classes()).toContain('duel-highlight')
    expect(characterButton.classes()).toContain('duel-highlight--targetable')
  })

  it('applies the shared preview highlight class to a board card linked from an effect prompt hover', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          characters: [createPublicCard('character-a')]
        }),
        side: 0,
        linkedPreviewInstanceId: 'character-a'
      },
      global: {
        stubs: zoneTestStubs()
      }
    })

    const characterButton = wrapper.get('[data-instance-id="character-a"]')

    expect(characterButton.classes()).toContain('duel-highlight')
    expect(characterButton.classes()).toContain('duel-highlight--preview')
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
        stubs: zoneTestStubs()
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
        stubs: zoneTestStubs()
      }
    })

    expect(wrapper.find('[data-layout-id="deck-ghost"]').classes()).toContain('duel-zone-ghost')
    expect(wrapper.find('[data-layout-id="character-a"]').classes()).toContain('duel-layout-card')
    expect(wrapper.find('[data-layout-id="stage-a"]').classes()).toContain('duel-layout-card')
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
        stubs: zoneTestStubs()
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
        stubs: zoneTestStubs()
      }
    })

    const deferredCostCard = wrapper.get('[data-instance-id="don-ready-2"]')

    expect(deferredCostCard.classes()).toContain('invisible')
    expect(deferredCostCard.attributes('data-layout-id')).toBeUndefined()
  })

  it('keeps deferred DON!! arrivals out of opacity-based reveal classes to avoid a flash at handoff', () => {
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
        stubs: zoneTestStubs()
      }
    })

    const deferredCostCard = wrapper.get('[data-instance-id="don-ready-2"]')

    expect(deferredCostCard.classes()).toContain('invisible')
    expect(deferredCostCard.classes()).not.toContain('opacity-0')
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
        stubs: zoneTestStubs()
      }
    })

    const deferredTrashCard = wrapper.get('[data-instance-id="trash-top"]')

    expect(deferredTrashCard.classes()).toContain('opacity-0')
    expect(deferredTrashCard.attributes('data-layout-id')).toBeUndefined()
  })

  it('keeps showing the previous trash card while a new deferred top-trash arrival travels in', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          trash: [
            createPublicCard('trash-top'),
            createPublicCard('trash-previous')
          ]
        }),
        side: 0,
        deferredTrashCardIds: ['trash-top']
      },
      global: {
        stubs: zoneTestStubs()
      }
    })

    const visibleTrashCard = wrapper.get('[data-trash-side="0"] [data-instance-id="trash-previous"]')
    const deferredTrashCard = wrapper.get('[data-trash-side="0"] [data-instance-id="trash-top"]')

    expect(visibleTrashCard.classes()).not.toContain('opacity-0')
    expect(deferredTrashCard.classes()).toContain('opacity-0')
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
        stubs: zoneTestStubs()
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
    const untappedFirstOffset = extractTranslateX(untappedCards[0]?.attributes('style') ?? '')
    const untappedSecondOffset = extractTranslateX(untappedCards[1]?.attributes('style') ?? '')
    const restedFirstOffset = extractTranslateX(restedCards[0]?.attributes('style') ?? '')
    const restedSecondOffset = extractTranslateX(restedCards[1]?.attributes('style') ?? '')

    expect(untappedFirstOffset).not.toBeNull()
    expect(untappedSecondOffset).not.toBeNull()
    expect(restedFirstOffset).not.toBeNull()
    expect(restedSecondOffset).not.toBeNull()
    expect(untappedFirstOffset).not.toBe(untappedSecondOffset)
    expect(restedFirstOffset).not.toBe(restedSecondOffset)
    expect(untappedSecondOffset).toBeGreaterThan(untappedFirstOffset ?? 0)
    expect(restedFirstOffset).toBeGreaterThan(untappedSecondOffset ?? 0)
    expect(restedSecondOffset).toBeGreaterThan(untappedSecondOffset ?? 0)
    expect(restedFirstOffset).toBeGreaterThanOrEqual(120)
    expect(restedSecondOffset).toBeGreaterThanOrEqual(120)
  })

  it('keeps the same DON!! cost card node when Refresh flips it from rested to untapped so CSS can animate the move', async () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          cost: [
            createPublicCard('don-refresh', { type: 'DON!!', cost: null, power: null, counter: null, rested: true }),
            createPublicCard('don-ready', { type: 'DON!!', cost: null, power: null, counter: null })
          ]
        }),
        side: 0
      },
      global: {
        stubs: zoneTestStubs()
      }
    })

    const beforeElement = wrapper.get('[data-instance-id="don-refresh"]').element
    expect(wrapper.get('[data-instance-id="don-refresh"]').attributes('data-cost-state')).toBe('rested')

    await wrapper.setProps({
      player: createPlayer({
        cost: [
          createPublicCard('don-refresh', { type: 'DON!!', cost: null, power: null, counter: null }),
          createPublicCard('don-ready', { type: 'DON!!', cost: null, power: null, counter: null })
        ]
      })
    })

    const afterCard = wrapper.get('[data-instance-id="don-refresh"]')

    expect(afterCard.element).toBe(beforeElement)
    expect(afterCard.attributes('data-cost-state')).toBe('untapped')
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
        stubs: zoneTestStubs()
      }
    })

    const characterAnchor = wrapper.get('[data-attached-don-anchor="character-a"]')
    const leaderAnchor = wrapper.get('[data-attached-don-anchor="leader-a"]')

    expect(characterAnchor.findAll('img[alt="DON!! attache"]')).toHaveLength(2)
    expect(leaderAnchor.findAll('img[alt="DON!! attache"]')).toHaveLength(1)
  })

  it('keeps the power badge above the attached DON!! stack', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          leader: createPublicCard('leader-a', { type: 'Leader', power: 5000, attachedDon: 1 }),
          characters: [
            createPublicCard('character-a', { power: 10000, attachedDon: 2 })
          ]
        }),
        side: 0
      },
      global: {
        stubs: zoneTestStubs()
      }
    })

    const badge = wrapper.findComponent(AnimatedPowerBadge)
    const badgeElement = badge.getComponent({ name: 'UBadge' })

    expect(wrapper.get('[data-attached-don-anchor="character-a"]').classes()).toContain('z-20')
    expect(badgeElement.classes()).toContain('z-30')
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
        stubs: zoneTestStubs()
      }
    })

    const characterAnchor = wrapper.get('[data-attached-don-anchor="character-a"]')

    expect(characterAnchor.attributes('style')).toContain('calc(58% + 56px)')
    expect(characterAnchor.findAll('img[alt="DON!! attache"]')).toHaveLength(5)
  })

  it('marks each attached DON!! slot so travel overlays can land on a single-card target', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          leader: createPublicCard('leader-a', { type: 'Leader', power: 5000, attachedDon: 2 }),
          characters: [
            createPublicCard('character-a', { attachedDon: 3 })
          ]
        }),
        side: 0
      },
      global: {
        stubs: zoneTestStubs()
      }
    })

    const characterSlots = wrapper.findAll('[data-attached-don-owner="character-a"]')
    const leaderSlots = wrapper.findAll('[data-attached-don-owner="leader-a"]')

    expect(characterSlots.map(node => node.attributes('data-attached-don-slot'))).toEqual(['0', '1', '2'])
    expect(leaderSlots.map(node => node.attributes('data-attached-don-slot'))).toEqual(['0', '1'])
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
        stubs: zoneTestStubs()
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
        stubs: zoneTestStubs()
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
        stubs: zoneTestStubs()
      }
    })

    await wrapper.get('[data-cost-state="untapped"]').trigger('mousedown', {
      shiftKey: true
    })

    expect(wrapper.emitted('donCardSelectionStart')).toEqual([['don-ready-1']])
  })

  it('extends DON!! selection while shift and the left button stay held', async () => {
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
        stubs: zoneTestStubs()
      }
    })

    await wrapper.findAll('[data-cost-state="untapped"]')[1]!.trigger('mouseenter', {
      shiftKey: true,
      buttons: 1
    })

    expect(wrapper.emitted('donCardSelectionHover')).toEqual([['don-ready-2']])
  })

  it('does not extend DON!! selection when shift is held without the left button', async () => {
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
        stubs: zoneTestStubs()
      }
    })

    await wrapper.findAll('[data-cost-state="untapped"]')[1]!.trigger('mouseenter', {
      shiftKey: true,
      buttons: 0
    })

    expect(wrapper.emitted('donCardSelectionHover')).toBeUndefined()
  })

  it('does not start an attack drag when a DON!! stack is already selected on an attackable character', async () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          characters: [createPublicCard('character-a')]
        }),
        side: 0,
        attackableCharacterIds: ['character-a'],
        selectedDonCardIds: ['don-ready-1', 'don-ready-2']
      },
      global: {
        stubs: zoneTestStubs()
      }
    })

    const characterButton = wrapper.get('[data-instance-id="character-a"]')

    await characterButton.trigger('pointerdown', { button: 0 })
    await characterButton.trigger('click')

    expect(wrapper.emitted('characterAttackStart')).toBeUndefined()
    expect(wrapper.emitted('characterClick')).toEqual([[0, 'character-a']])
  })

  it('does not start an attack drag when an attackable character is being selected for replacement', async () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          characters: [createPublicCard('character-a')]
        }),
        side: 0,
        isSelectable: true,
        attackableCharacterIds: ['character-a'],
        selectableCharacterIds: ['character-a']
      },
      global: {
        stubs: zoneTestStubs()
      }
    })

    const characterButton = wrapper.get('[data-instance-id="character-a"]')

    await characterButton.trigger('pointerdown', { button: 0 })
    await characterButton.trigger('click')

    expect(wrapper.emitted('characterAttackStart')).toBeUndefined()
    expect(wrapper.emitted('characterClick')).toEqual([[0, 'character-a']])
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
        stubs: zoneTestStubs()
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
        stubs: zoneTestStubs()
      }
    })

    const badge = wrapper.get('[data-selected-don-count]')

    expect(badge.text()).toBe('3')
    expect(badge.attributes('title')).toContain('3 DON!!')
  })
})
