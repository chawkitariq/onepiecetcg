<script setup lang="ts">
import type { DuelLogEntry, DuelPlayerView, PrivateCard, PublicCard } from '@onepiecetcg/shared'

type DuelCombatView = {
  attackerSessionId: string
  attackerInstanceId: string
  defenderSessionId: string
  targetType: 'leader' | 'character'
  targetInstanceId?: string
  blockerInstanceId?: string
  step: 'declared' | 'blocked' | 'countering' | 'resolving' | 'resolved'
  counterPowerBonus: number
  awaitingTriggerDecision: boolean
}

type RuntimeCheckStatus = 'running' | 'pass' | 'fail'

const runtimeStatus = ref<RuntimeCheckStatus>('running')
const runtimeMessages = ref<string[]>(['Booting duel runtime check...'])
const runtimeSummary = ref('booting')

const phase = ref('main')
const self = ref<DuelPlayerView | null>(null)
const opponent = ref<DuelPlayerView | null>(null)
const logs = ref<DuelLogEntry[]>([])
const errorMessage = ref<string | null>(null)
const combat = ref<DuelCombatView | null>(null)
const colyseusStatus = ref<'idle' | 'connecting' | 'connected' | 'error'>('connected')

function pushMessage(message: string) {
  runtimeMessages.value = [...runtimeMessages.value, message]
}

function setRuntimeTitle() {
  document.title = `${runtimeStatus.value.toUpperCase()} duel runtime check ${runtimeSummary.value}`
}

function failRuntimeCheck(message: string): never {
  runtimeStatus.value = 'fail'
  runtimeSummary.value = message.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').slice(0, 80)
  pushMessage(`FAIL: ${message}`)
  setRuntimeTitle()
  throw new Error(message)
}

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

function createPrivateCard(instanceId: string, overrides: Partial<PrivateCard> = {}): PrivateCard {
  return {
    ...createPublicCard(instanceId, overrides),
    text: '',
    trigger: null,
    ...overrides
  }
}

function createPlayer(sessionId: string, overrides: Partial<DuelPlayerView> = {}): DuelPlayerView {
  return {
    sessionId,
    displayName: sessionId,
    deckId: `${sessionId}-deck`,
    ready: true,
    connected: true,
    mulliganDecided: true,
    hasTakenFirstTurn: true,
    leader: createPublicCard(`${sessionId}-leader`, { type: 'Leader', power: 5000 }),
    stage: null,
    characters: [],
    cost: [
      createPublicCard(`${sessionId}-don-1`, { type: 'DON!!', cost: null, power: null, counter: null }),
      createPublicCard(`${sessionId}-don-2`, { type: 'DON!!', cost: null, power: null, counter: null }),
      createPublicCard(`${sessionId}-don-3`, { type: 'DON!!', cost: null, power: null, counter: null })
    ],
    trash: [],
    donDeckCount: 10,
    hand: [],
    handCount: 0,
    deck: [],
    deckCount: 30,
    life: [],
    lifeCount: 4,
    ...overrides
  }
}

function createBaselineSelfPlayer() {
  return createPlayer('self', {
    characters: [createPublicCard('self-character-a')],
    hand: [
      createPrivateCard('runtime-hand-character', { type: 'Character', cost: 1 }),
      createPrivateCard('runtime-hand-stage', { type: 'Stage', cost: 1, power: null, counter: null }),
      createPrivateCard('runtime-hand-event', { type: 'Event', cost: 1, power: null, counter: null })
    ],
    handCount: 3,
    lifeCount: 4
  })
}

function createBaselineOpponentPlayer() {
  return createPlayer('opponent', {
    characters: [createPublicCard('opponent-character-a', { rested: true })]
  })
}

function resetBoardState() {
  self.value = createBaselineSelfPlayer()
  opponent.value = createBaselineOpponentPlayer()
  logs.value = []
  errorMessage.value = null
  combat.value = null
}

function wait(ms: number) {
  return new Promise(resolve => window.setTimeout(resolve, ms))
}

function nextAnimationFrame() {
  return new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
}

function cloneCardAsPublic(card: PrivateCard | PublicCard, overrides: Partial<PublicCard> = {}) {
  return createPublicCard(card.instanceId, {
    type: card.type,
    cost: card.cost,
    power: card.power,
    counter: card.counter,
    imageUrl: card.imageUrl,
    ...overrides
  })
}

function splitPatchPlay(instanceId: string) {
  const current = self.value

  if (!current) {
    return
  }

  const card = current.hand.find(candidate => candidate.instanceId === instanceId)

  if (!card) {
    return
  }

  const remainingHand = current.hand.filter(candidate => candidate.instanceId !== instanceId)

  self.value = {
    ...current,
    hand: remainingHand,
    handCount: remainingHand.length
  }

  window.setTimeout(() => {
    const latest = self.value

    if (!latest) {
      return
    }

    if (card.type === 'Stage') {
      self.value = {
        ...latest,
        stage: cloneCardAsPublic(card, { type: 'Stage', power: null, counter: null })
      }
      return
    }

    self.value = {
      ...latest,
      characters: [...latest.characters, cloneCardAsPublic(card)]
    }
  }, 40)
}

const duelRoomOverride = {
  self,
  opponent,
  phase,
  isSelfTurn: computed(() => true),
  isMainPhase: computed(() => phase.value === 'main'),
  canEndPhase: computed(() => true),
  selfUntappedDonCount: computed(() => self.value?.cost.filter(card => !card.rested).length ?? 0),
  isSelfCharacterZoneFull: computed(() => (self.value?.characters.length ?? 0) >= 5),
  logs,
  errorMessage,
  endPhase: () => {},
  playCard: (instanceId: string) => splitPatchPlay(instanceId),
  attachDon: () => {},
  clearError: () => {
    errorMessage.value = null
  },
  combat,
  isCombatInProgress: computed(() => Boolean(combat.value?.attackerInstanceId)),
  isSelfAttacker: computed(() => false),
  isSelfDefender: computed(() => true),
  canDeclareAttack: computed(() => false),
  isBlockingStep: computed(() => combat.value?.step === 'blocked'),
  isCounteringStep: computed(() => combat.value?.step === 'countering'),
  isAwaitingTriggerDecision: computed(() => Boolean(combat.value?.awaitingTriggerDecision)),
  declareAttack: () => {},
  declareBlock: () => {},
  declareCounter: () => {},
  finishCounterStep: () => {},
  resolveTrigger: () => {},
  isOpponentDisconnected: computed(() => false),
  chooseFirstOrSecond: () => {},
  mulligan: () => {},
  startingPlayerSessionId: computed(() => null),
  firstPlayerSessionId: computed(() => null),
  activePlayerSessionId: computed(() => self.value?.sessionId ?? null),
  isSelfDesignatedToChoose: computed(() => false),
  isSelfTurnToMulligan: computed(() => false)
}

const colyseusOverride = {
  client: shallowRef(null),
  room: shallowRef(null),
  status: colyseusStatus,
  error: ref(''),
  joinDuel: async () => null,
  createPrivateRoom: async () => null,
  joinPrivateRoom: async () => null,
  reconnect: async () => null,
  getStoredReconnectionToken: () => null,
  leave: async () => {},
  sendMessage: () => {}
}

function setWindowOverrides() {
  const runtimeWindow = window as typeof window & {
    __DUEL_ROOM_DEV_OVERRIDE__?: typeof duelRoomOverride
    __COLYSEUS_DEV_OVERRIDE__?: typeof colyseusOverride
  }

  runtimeWindow.__DUEL_ROOM_DEV_OVERRIDE__ = duelRoomOverride
  runtimeWindow.__COLYSEUS_DEV_OVERRIDE__ = colyseusOverride
}

function clearWindowOverrides() {
  const runtimeWindow = window as typeof window & {
    __DUEL_ROOM_DEV_OVERRIDE__?: typeof duelRoomOverride
    __COLYSEUS_DEV_OVERRIDE__?: typeof colyseusOverride
  }

  delete runtimeWindow.__DUEL_ROOM_DEV_OVERRIDE__
  delete runtimeWindow.__COLYSEUS_DEV_OVERRIDE__
}

async function assertConfirmedArrowAnimation() {
  combat.value = {
    attackerSessionId: 'opponent',
    attackerInstanceId: 'opponent-character-a',
    defenderSessionId: 'self',
    targetType: 'leader',
    targetInstanceId: 'self-leader',
    blockerInstanceId: '',
    step: 'blocked',
    counterPowerBonus: 0,
    awaitingTriggerDecision: false
  }

  await nextTick()
  await nextAnimationFrame()
  await wait(70)

  const line = document.querySelector('.duel-attack-arrow-confirmed') as SVGLineElement | null

  if (!line) {
    failRuntimeCheck('Confirmed attack arrow never rendered.')
  }

  const earlyDelta = Math.hypot(
    Number(line.getAttribute('x2')) - Number(line.getAttribute('x1')),
    Number(line.getAttribute('y2')) - Number(line.getAttribute('y1'))
  )

  await wait(260)

  const settledLine = document.querySelector('.duel-attack-arrow-confirmed') as SVGLineElement | null

  if (!settledLine) {
    failRuntimeCheck('Confirmed attack arrow disappeared before it could settle.')
  }

  const finalDelta = Math.hypot(
    Number(settledLine.getAttribute('x2')) - Number(settledLine.getAttribute('x1')),
    Number(settledLine.getAttribute('y2')) - Number(settledLine.getAttribute('y1'))
  )

  if (!(finalDelta > earlyDelta + 30)) {
    failRuntimeCheck(`Confirmed attack arrow did not travel: early=${earlyDelta.toFixed(1)} final=${finalDelta.toFixed(1)}`)
  }

  combat.value = {
    ...combat.value,
    blockerInstanceId: 'self-character-a',
    step: 'countering'
  }
  await nextTick()
  await wait(80)

  const postBlockLine = document.querySelector('.duel-attack-arrow-confirmed') as SVGLineElement | null

  if (!postBlockLine) {
    failRuntimeCheck('Confirmed attack arrow disappeared after blocker selection.')
  }

  const postBlockDelta = Math.hypot(
    Number(postBlockLine.getAttribute('x2')) - Number(postBlockLine.getAttribute('x1')),
    Number(postBlockLine.getAttribute('y2')) - Number(postBlockLine.getAttribute('y1'))
  )

  if (postBlockDelta < finalDelta * 0.9) {
    failRuntimeCheck(`Confirmed attack arrow replayed after blocker selection: settled=${finalDelta.toFixed(1)} blocker=${postBlockDelta.toFixed(1)}`)
  }

  pushMessage('Confirmed arrow animation passed.')
  runtimeSummary.value = 'arrow-pass'
  setRuntimeTitle()
}

async function assertSelfHandToBoardTravel(instanceId: 'runtime-hand-character' | 'runtime-hand-stage') {
  const selector = `[data-duel-hand="true"] [data-instance-id="${instanceId}"]`
  const handCard = document.querySelector(selector) as HTMLElement | null

  if (!handCard) {
    failRuntimeCheck(`Hand card ${instanceId} was not rendered.`)
  }

  handCard.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  await nextTick()
  await wait(80)
  await nextTick()

  const overlay = document.querySelector(`[data-board-travel-instance-id="${instanceId}"]`) as HTMLElement | null

  if (!overlay) {
    failRuntimeCheck(`No board travel overlay was created for ${instanceId}.`)
  }

  pushMessage(`Board travel overlay passed for ${instanceId}.`)
  runtimeSummary.value = `${instanceId}-pass`
  setRuntimeTitle()
}

async function assertLifeToHandDeduped() {
  resetBoardState()
  await nextTick()

  let revealedLifeOverlayCount = 0
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) {
          continue
        }

        const overlays = [
          node,
          ...Array.from(node.querySelectorAll?.('[data-board-travel-instance-id="runtime-revealed-life"]') ?? [])
        ]
        revealedLifeOverlayCount += overlays.filter(element =>
          element instanceof HTMLElement
          && element.getAttribute('data-board-travel-instance-id') === 'runtime-revealed-life'
        ).length
      }
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })

  const baseSelf = self.value

  if (!baseSelf) {
    failRuntimeCheck('Missing self player before life-to-hand test.')
  }

  self.value = {
    ...baseSelf,
    lifeCount: 3
  }
  await nextTick()
  await wait(50)

  self.value = {
    ...self.value!,
    hand: [
      ...self.value!.hand,
      createPrivateCard('runtime-revealed-life', { type: 'Character', cost: 2 })
    ],
    handCount: self.value!.handCount + 1
  }
  await nextTick()
  await wait(120)

  self.value = {
    ...self.value!,
    cost: self.value!.cost.map((card, index) => index === 0 ? { ...card, rested: true } : card)
  }
  await nextTick()
  await wait(200)

  observer.disconnect()

  if (revealedLifeOverlayCount !== 1) {
    failRuntimeCheck(`Expected 1 life-to-hand overlay, saw ${revealedLifeOverlayCount}.`)
  }

  pushMessage('Life-to-hand dedupe passed.')
  runtimeSummary.value = 'life-dedupe-pass'
  setRuntimeTitle()
}

async function runRuntimeChecks() {
  resetBoardState()
  await nextTick()
  await nextAnimationFrame()
  await wait(120)

  await assertConfirmedArrowAnimation()

  resetBoardState()
  await nextTick()
  await wait(80)
  await assertSelfHandToBoardTravel('runtime-hand-character')

  resetBoardState()
  await nextTick()
  await wait(80)
  await assertSelfHandToBoardTravel('runtime-hand-stage')

  await assertLifeToHandDeduped()

  runtimeStatus.value = 'pass'
  runtimeSummary.value = 'all-checks-passed'
  pushMessage('All duel runtime checks passed.')
  setRuntimeTitle()
}

if (import.meta.client) {
  setWindowOverrides()
}

onMounted(async () => {
  setRuntimeTitle()

  if (!import.meta.dev) {
    runtimeStatus.value = 'fail'
    pushMessage('This page only runs in development.')
    setRuntimeTitle()
    return
  }

  try {
    await runRuntimeChecks()
  } catch (error) {
    if (runtimeStatus.value !== 'fail') {
      runtimeStatus.value = 'fail'
      pushMessage(error instanceof Error ? error.message : 'Unknown runtime check failure.')
      setRuntimeTitle()
    }
  }
})

onBeforeUnmount(() => {
  clearWindowOverrides()
})
</script>

<template>
  <div class="flex min-h-screen flex-col gap-4 bg-default p-4">
    <div class="rounded-2xl border border-default bg-elevated/80 p-4 shadow-sm">
      <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
        Duel Runtime Check
      </p>
      <p class="mt-2 text-sm text-muted">
        Status: {{ runtimeStatus }}
      </p>
      <pre class="mt-3 whitespace-pre-wrap text-xs text-toned">{{ runtimeMessages.join('\n') }}</pre>
    </div>

    <div class="min-h-0 flex-1 overflow-hidden rounded-2xl border border-default bg-default">
      <DuelBoard />
    </div>
  </div>
</template>
