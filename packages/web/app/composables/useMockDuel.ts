import type {
  CardColor,
  CardType,
  DuelLogEntry,
  DuelPlayerView,
  GamePhase,
  PrivateCard,
  PublicCard
} from '@onepiecetcg/shared'

/**
 * Local, client-only duel simulation used to exercise `PlayZone` before the
 * Colyseus `duel` room (docs/plan.md étape 5) is wired to a real deck/room/auth.
 * Every rule applied here mirrors the structural engine described in
 * docs/optcg-rules.md (phases, DON!! placement, zone limits, power calc,
 * combat) — nothing here should be treated as authoritative once the API
 * exposes the real room.
 */

type MockCardTemplate = {
  number: string
  name: string
  type: CardType
  colors: CardColor[]
  cost: number | null
  power: number | null
  life: number | null
  counter: number | null
  text: string
  trigger: string | null
}

const PLACEHOLDER_IMAGE = 'https://optcgapi.com/media/static/Card_Images/OP03-075.jpg'

const LEADER_TEMPLATE: MockCardTemplate = {
  number: 'OP01-001',
  name: 'Monkey D. Luffy',
  type: 'Leader',
  colors: ['Red'],
  cost: null,
  power: 5000,
  life: 5,
  counter: null,
  text: '[DON!! x1] Cette carte gagne +1000 de puissance.',
  trigger: null
}

const STAGE_TEMPLATE: MockCardTemplate = {
  number: 'OP01-050',
  name: 'Thousand Sunny',
  type: 'Stage',
  colors: ['Red'],
  cost: 2,
  power: null,
  life: null,
  counter: null,
  text: 'Vos Personnages Equipage du Chapeau de Paille gagnent +1000 de puissance.',
  trigger: null
}

const CHARACTER_TEMPLATES: MockCardTemplate[] = [
  { number: 'OP01-013', name: 'Roronoa Zoro', type: 'Character', colors: ['Red'], cost: 3, power: 5000, life: null, counter: 1000, text: '[Quand cette carte attaque] Ne peut pas être bloquée.', trigger: null },
  { number: 'OP01-016', name: 'Nami', type: 'Character', colors: ['Red'], cost: 1, power: 1000, life: null, counter: 2000, text: '[Jouée] Piochez 1 carte, puis défaussez 1 carte.', trigger: null },
  { number: 'OP01-025', name: 'Tony Tony Chopper', type: 'Character', colors: ['Red'], cost: 1, power: 2000, life: null, counter: 1000, text: '', trigger: null },
  { number: 'OP01-031', name: 'Usopp', type: 'Character', colors: ['Red'], cost: 2, power: 3000, life: null, counter: 1000, text: '', trigger: 'Gagnez 1000 de puissance jusqu\'à la fin du tour.' },
  { number: 'OP01-041', name: 'Sanji', type: 'Character', colors: ['Red'], cost: 2, power: 4000, life: null, counter: 1000, text: '', trigger: null },
  { number: 'OP01-047', name: 'Franky', type: 'Character', colors: ['Red'], cost: 4, power: 6000, life: null, counter: 1000, text: '', trigger: null }
]

const EVENT_TEMPLATES: MockCardTemplate[] = [
  { number: 'OP01-020', name: 'Gum-Gum Red Roc', type: 'Event', colors: ['Red'], cost: 2, power: null, life: null, counter: null, text: 'Jusqu\'à la fin du tour, un de vos Personnages gagne +4000 de puissance.', trigger: null }
]

const DON_TEMPLATE: MockCardTemplate = {
  number: 'DON',
  name: 'DON!!',
  type: 'DON!!',
  colors: [],
  cost: null,
  power: null,
  life: null,
  counter: null,
  text: '',
  trigger: null
}

const PHASE_ORDER: GamePhase[] = ['refresh', 'draw', 'don', 'main', 'end']
const MAX_CHARACTERS = 5

let instanceCounter = 0

function nextInstanceId(prefix: string): string {
  instanceCounter += 1
  return `${prefix}-${instanceCounter}`
}

function createCard(template: MockCardTemplate): PrivateCard {
  return {
    instanceId: nextInstanceId('card'),
    cardId: template.number,
    number: template.number,
    name: template.name,
    type: template.type,
    colors: template.colors,
    cost: template.cost,
    power: template.power,
    life: template.life,
    counter: template.counter,
    imageUrl: template.type === 'DON!!' ? null : PLACEHOLDER_IMAGE,
    rested: false,
    attachedDon: 0,
    playedThisTurn: false,
    text: template.text,
    trigger: template.trigger
  }
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const left = copy[i]
    const right = copy[j]

    if (left !== undefined && right !== undefined) {
      copy[i] = right
      copy[j] = left
    }
  }

  return copy
}

function buildMainDeck(): PrivateCard[] {
  const templates = [...CHARACTER_TEMPLATES, ...CHARACTER_TEMPLATES, ...EVENT_TEMPLATES, STAGE_TEMPLATE]
  const cards: PrivateCard[] = []

  while (cards.length < 50) {
    for (const template of templates) {
      if (cards.length >= 50) {
        break
      }

      cards.push(createCard(template))
    }
  }

  return shuffle(cards)
}

interface MockPlayerState extends DuelPlayerView {
  deckCards: PrivateCard[]
  donDeckCards: PrivateCard[]
  lifeCards: PrivateCard[]
}

function createPlayer(displayName: string, deckId: string, sessionId: string): MockPlayerState {
  const leader = createCard(LEADER_TEMPLATE)
  const deckCards = buildMainDeck()
  const donDeckCards = Array.from({ length: 10 }, () => createCard(DON_TEMPLATE))
  const hand = deckCards.splice(0, 5)
  const lifeCards = deckCards.splice(0, leader.life ?? 5)

  return {
    sessionId,
    authUserId: sessionId,
    displayName,
    deckId,
    ready: true,
    connected: true,
    leader,
    hand,
    opponentHandCount: 0,
    lifeCount: lifeCards.length,
    deckCount: deckCards.length,
    donDeckCount: donDeckCards.length,
    characters: [],
    stage: null,
    cost: [],
    trash: [],
    deckCards,
    donDeckCards,
    lifeCards
  }
}

function syncCounts(player: MockPlayerState, opponent: MockPlayerState) {
  player.deckCount = player.deckCards.length
  player.donDeckCount = player.donDeckCards.length
  player.lifeCount = player.lifeCards.length
  player.opponentHandCount = opponent.hand.length
}

export function useMockDuel() {
  const players = ref<[MockPlayerState, MockPlayerState]>([
    createPlayer('Joueur 1', 'mock-deck-1', 'mock-session-1'),
    createPlayer('Joueur 2', 'mock-deck-2', 'mock-session-2')
  ])
  const startingPlayerIndex = ref<0 | 1>(Math.random() < 0.5 ? 0 : 1)
  const activePlayerIndex = ref<0 | 1>(startingPlayerIndex.value)
  const phase = ref<GamePhase>('refresh')
  const turnsTaken = ref<[number, number]>([0, 0])
  const logs = ref<DuelLogEntry[]>([])
  const winner = ref<0 | 1 | null>(null)
  const attackerSelection = ref<string | null>(null)

  function log(message: string) {
    logs.value.unshift({ id: nextInstanceId('log'), message, createdAt: new Date().toISOString() })
  }

  function resync() {
    syncCounts(players.value[0], players.value[1])
    syncCounts(players.value[1], players.value[0])
  }

  function isFirstTurnFor(idx: 0 | 1): boolean {
    return turnsTaken.value[idx] === 1
  }

  function refreshPhase(idx: 0 | 1) {
    const p = players.value[idx]
    let returned = 0

    if (p.leader && p.leader.attachedDon > 0) {
      returned += p.leader.attachedDon
      p.leader = { ...p.leader, attachedDon: 0, rested: false }
    } else if (p.leader) {
      p.leader = { ...p.leader, rested: false }
    }

    p.characters = p.characters.map((character) => {
      returned += character.attachedDon
      return { ...character, attachedDon: 0, rested: false, playedThisTurn: false }
    })

    if (p.stage) {
      p.stage = { ...p.stage, rested: false }
    }

    const returnedCards = Array.from({ length: returned }, () => createCard(DON_TEMPLATE))
    p.cost = [...p.cost.map(card => ({ ...card, rested: false })), ...returnedCards]
    turnsTaken.value[idx] += 1
    resync()
  }

  function drawPhase(idx: 0 | 1) {
    const p = players.value[idx]
    const skip = turnsTaken.value[idx] === 1 && idx === startingPlayerIndex.value

    if (skip) {
      log(`${p.displayName} ne pioche pas (premier tour).`)
      return
    }

    const drawn = p.deckCards.shift()

    if (!drawn) {
      winner.value = idx === 0 ? 1 : 0
      phase.value = 'finished'
      log(`${p.displayName} ne peut plus piocher : deck-out, défaite.`)
      return
    }

    p.hand.push(drawn)
    resync()
    log(`${p.displayName} pioche 1 carte.`)
  }

  function donPhase(idx: 0 | 1) {
    const p = players.value[idx]
    const isFirstTurn = turnsTaken.value[idx] === 1 && idx === startingPlayerIndex.value
    const desired = isFirstTurn ? 1 : 2
    const count = Math.min(desired, p.donDeckCards.length)
    const drawn = p.donDeckCards.splice(0, count)
    p.cost = [...p.cost, ...drawn]
    resync()
    log(`${p.displayName} place ${count} carte(s) DON!! en zone de Coût.`)
  }

  function startGame() {
    phase.value = 'refresh'
    refreshPhase(activePlayerIndex.value)
    log(`${players.value[activePlayerIndex.value].displayName} commence la partie.`)
  }

  function nextPhase() {
    if (phase.value === 'finished') {
      return
    }

    if (phase.value === 'end') {
      endTurn()
      return
    }

    const currentIndex = PHASE_ORDER.indexOf(phase.value)
    const upcoming = PHASE_ORDER[currentIndex + 1] ?? 'end'
    const idx = activePlayerIndex.value

    if (upcoming === 'draw') {
      drawPhase(idx)
    } else if (upcoming === 'don') {
      donPhase(idx)
    }

    phase.value = upcoming
  }

  function endTurn() {
    const idx = activePlayerIndex.value
    log(`${players.value[idx].displayName} termine son tour.`)
    activePlayerIndex.value = idx === 0 ? 1 : 0
    attackerSelection.value = null
    phase.value = 'refresh'
    refreshPhase(activePlayerIndex.value)
  }

  function useDonCards(p: MockPlayerState, amount: number): boolean {
    const availableIndexes = p.cost
      .map((card, index) => ({ card, index }))
      .filter(entry => !entry.card.rested)
      .slice(0, amount)

    if (availableIndexes.length < amount) {
      return false
    }

    for (const entry of availableIndexes) {
      p.cost[entry.index] = { ...entry.card, rested: true }
    }

    return true
  }

  function takeUntappedDon(p: MockPlayerState): PublicCard | null {
    const index = p.cost.findIndex(card => !card.rested)

    if (index === -1) {
      return null
    }

    return p.cost.splice(index, 1)[0] ?? null
  }

  function assertMainPhase(idx: 0 | 1): boolean {
    if (phase.value !== 'main' || activePlayerIndex.value !== idx) {
      log('Action impossible : ce n\'est pas la phase Principale de ce joueur.')
      return false
    }

    return true
  }

  function playCard(idx: 0 | 1, instanceId: string) {
    if (!assertMainPhase(idx)) {
      return
    }

    const p = players.value[idx]
    const handIndex = p.hand.findIndex(card => card.instanceId === instanceId)
    const card = p.hand[handIndex]

    if (handIndex === -1 || !card) {
      return
    }

    if (card.type === 'Character' && p.characters.length >= MAX_CHARACTERS) {
      log(`Zone Personnage pleine (${MAX_CHARACTERS} max) : défaussez avant de rejouer ${card.name}.`)
      return
    }

    const cost = card.cost ?? 0

    if (!useDonCards(p, cost)) {
      log(`DON!! insuffisant pour jouer ${card.name} (coût ${cost}).`)
      return
    }

    p.hand.splice(handIndex, 1)

    if (card.type === 'Character') {
      p.characters.push({ ...card, playedThisTurn: true, rested: false })
      log(`${p.displayName} joue ${card.name} en zone Personnage.`)
    } else if (card.type === 'Stage') {
      if (p.stage) {
        p.trash.unshift(p.stage)
      }

      p.stage = { ...card, playedThisTurn: true, rested: false }
      log(`${p.displayName} joue ${card.name} en zone Lieu.`)
    } else if (card.type === 'Event') {
      p.trash.unshift(card)
      log(`${p.displayName} active ${card.name} (effet à appliquer manuellement) puis la défausse.`)
    }

    resync()
  }

  function attachDon(idx: 0 | 1, target: 'leader' | 'character', targetInstanceId?: string) {
    if (!assertMainPhase(idx)) {
      return
    }

    const p = players.value[idx]
    const donCard = takeUntappedDon(p)

    if (!donCard) {
      log('Aucun DON!! redressé disponible en zone de Coût.')
      return
    }

    if (target === 'leader' && p.leader) {
      p.leader = { ...p.leader, attachedDon: p.leader.attachedDon + 1 }
      log(`${p.displayName} donne 1 DON!! à son Leader (+1000 de puissance).`)
    } else {
      const characterIndex = p.characters.findIndex(card => card.instanceId === targetInstanceId)
      const character = p.characters[characterIndex]

      if (characterIndex === -1 || !character) {
        p.cost.push(donCard)
        return
      }

      p.characters[characterIndex] = { ...character, attachedDon: character.attachedDon + 1 }
      log(`${p.displayName} donne 1 DON!! à ${character.name} (+1000 de puissance).`)
    }

    resync()
  }

  function cardPower(card: PublicCard): number {
    return (card.power ?? 0) + card.attachedDon * 1000
  }

  function selectAttacker(idx: 0 | 1, instanceId: string) {
    if (!assertMainPhase(idx)) {
      return
    }

    if (isFirstTurnFor(idx)) {
      log('Un joueur ne peut pas attaquer pendant son propre premier tour.')
      return
    }

    const p = players.value[idx]
    const attacker = instanceId === p.leader?.instanceId
      ? p.leader
      : p.characters.find(card => card.instanceId === instanceId)

    if (!attacker) {
      return
    }

    if (attacker.rested) {
      log(`${attacker.name} est déjà épuisé.`)
      return
    }

    if (attacker.type === 'Character' && attacker.playedThisTurn) {
      log(`${attacker.name} a été joué ce tour-ci, il ne peut pas attaquer.`)
      return
    }

    attackerSelection.value = attackerSelection.value === instanceId ? null : instanceId
  }

  function declareAttack(idx: 0 | 1, targetType: 'leader' | 'character', targetInstanceId?: string) {
    if (!assertMainPhase(idx) || !attackerSelection.value) {
      return
    }

    const attackerIdx = idx
    const defenderIdx = idx === 0 ? 1 : 0
    const attackerPlayer = players.value[attackerIdx]
    const defenderPlayer = players.value[defenderIdx]
    const attackerId = attackerSelection.value
    const attacker = attackerId === attackerPlayer.leader?.instanceId
      ? attackerPlayer.leader
      : attackerPlayer.characters.find(card => card.instanceId === attackerId)

    if (!attacker) {
      attackerSelection.value = null
      return
    }

    const target = targetType === 'leader'
      ? defenderPlayer.leader
      : defenderPlayer.characters.find(card => card.instanceId === targetInstanceId)

    if (!target) {
      return
    }

    if (targetType === 'character' && !target.rested) {
      log('Cible invalide : seul un Personnage adverse épuisé peut être attaqué.')
      return
    }

    if (attackerId === attackerPlayer.leader?.instanceId) {
      attackerPlayer.leader = { ...attackerPlayer.leader, rested: true }
    } else {
      const attackerIndex = attackerPlayer.characters.findIndex(card => card.instanceId === attackerId)

      if (attackerIndex !== -1) {
        attackerPlayer.characters[attackerIndex] = { ...attackerPlayer.characters[attackerIndex]!, rested: true }
      }
    }

    attackerSelection.value = null
    log(`${attackerPlayer.displayName} attaque avec ${attacker.name} (${cardPower(attacker)}) contre ${target.name} (${cardPower(target)}). Blocage/Contre non simulés dans ce mock.`)

    if (cardPower(attacker) < cardPower(target)) {
      log('Puissance insuffisante : l\'attaque est repoussée.')
      return
    }

    if (targetType === 'leader') {
      if (defenderPlayer.lifeCards.length === 0) {
        winner.value = attackerIdx
        phase.value = 'finished'
        log(`${defenderPlayer.displayName} n'a plus de Vie : ${attackerPlayer.displayName} remporte la partie.`)
        return
      }

      const lifeCard = defenderPlayer.lifeCards.shift()

      if (lifeCard) {
        defenderPlayer.hand.push(lifeCard)
        log(`${defenderPlayer.displayName} révèle sa carte de Vie (${lifeCard.name}) et la rejoint sa main (déclenchement éventuel à appliquer manuellement).`)
      }

      resync()
    } else {
      const characterIndex = defenderPlayer.characters.findIndex(card => card.instanceId === targetInstanceId)

      if (characterIndex !== -1) {
        const [ko] = defenderPlayer.characters.splice(characterIndex, 1)

        if (ko) {
          defenderPlayer.trash.unshift(ko)
          log(`${ko.name} est mis KO et rejoint la Défausse.`)
        }
      }
    }
  }

  function cancelAttack() {
    attackerSelection.value = null
  }

  function resetGame() {
    instanceCounter = 0
    players.value = [
      createPlayer('Joueur 1', 'mock-deck-1', 'mock-session-1'),
      createPlayer('Joueur 2', 'mock-deck-2', 'mock-session-2')
    ]
    startingPlayerIndex.value = Math.random() < 0.5 ? 0 : 1
    activePlayerIndex.value = startingPlayerIndex.value
    turnsTaken.value = [0, 0]
    logs.value = []
    winner.value = null
    attackerSelection.value = null
    startGame()
  }

  startGame()

  return {
    players,
    phase,
    activePlayerIndex,
    startingPlayerIndex,
    turnsTaken,
    logs,
    winner,
    attackerSelection,
    cardPower,
    nextPhase,
    playCard,
    attachDon,
    selectAttacker,
    declareAttack,
    cancelAttack,
    resetGame
  }
}
