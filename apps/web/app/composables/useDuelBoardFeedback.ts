import { animate } from 'animejs'
import {
  getDuelBannerFeedbackAnimation,
  getDuelCardFeedbackAnimation,
  resolveDuelFeedbackClasses,
  type DuelBannerFeedbackFamily,
  type DuelCardFeedbackFamily,
  type DuelFloatingFeedbackFamily
} from '~/utils/duelFeedback'
import type { Ref } from 'vue'

type FloatingNumberInstance = {
  key: number
  value: string
  x: number
  y: number
  family: DuelFloatingFeedbackFamily
}

type CardFeedbackInstance = {
  key: number
  label: string
  x: number
  y: number
  family: DuelCardFeedbackFamily
}

type BannerFeedbackInstance = {
  key: number
  message: string
  family: DuelBannerFeedbackFamily
}

type UseDuelBoardFeedbackOptions = {
  appConfig: ReturnType<typeof useAppConfig>
  reducedMotion: Ref<string>
  queryCardElement: (instanceId: string) => HTMLElement | null
}

/**
 * Manages duel board floating/card/banner feedback state and animations.
 */
export function useDuelBoardFeedback(options: UseDuelBoardFeedbackOptions) {
  const floatingNumbers = ref<FloatingNumberInstance[]>([])
  const cardFeedbacks = ref<CardFeedbackInstance[]>([])
  const bannerFeedbacks = ref<BannerFeedbackInstance[]>([])
  const isTurnFeedbackVisible = ref(false)

  const cardFeedbackElements = new Map<number, HTMLElement>()
  const bannerFeedbackElements = new Map<number, HTMLElement>()
  let floatingFeedbackKey = 0
  let cardFeedbackKey = 0
  let bannerFeedbackKey = 0
  let turnFeedbackTimeoutHandle: number | null = null

  function spawnLifeLossFloatingNumber(leaderInstanceId: string | undefined, lifeLoss: number) {
    const element = leaderInstanceId ? options.queryCardElement(leaderInstanceId) : null

    if (!element) {
      return
    }

    const rect = element.getBoundingClientRect()
    floatingFeedbackKey += 1
    floatingNumbers.value = [...floatingNumbers.value, {
      key: floatingFeedbackKey,
      value: `-${lifeLoss}`,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      family: 'impact'
    }]
  }

  function removeFloatingNumber(key: number) {
    floatingNumbers.value = floatingNumbers.value.filter(entry => entry.key !== key)
  }

  function spawnCardFeedbackAtPosition(
    x: number,
    y: number,
    label: string,
    family: DuelCardFeedbackFamily
  ) {
    cardFeedbackKey += 1
    const key = cardFeedbackKey
    cardFeedbacks.value = [...cardFeedbacks.value, {
      key,
      label,
      x,
      y,
      family
    }]

    nextTick(() => {
      const element = cardFeedbackElements.get(key)

      if (!element) {
        removeCardFeedback(key)
        return
      }

      animate(element, getDuelCardFeedbackAnimation(
        family,
        options.reducedMotion.value === 'reduce',
        () => removeCardFeedback(key)
      ))
    })
  }

  function spawnCardFeedback(instanceId: string | undefined, label: string, family: DuelCardFeedbackFamily) {
    const element = instanceId ? options.queryCardElement(instanceId) : null

    if (element) {
      const rect = element.getBoundingClientRect()

      spawnCardFeedbackAtPosition(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        label,
        family
      )
      return
    }

    spawnCardFeedbackAtPosition(
      window.innerWidth / 2,
      Math.max(window.innerHeight * 0.24, 140),
      label,
      family
    )
  }

  function removeCardFeedback(key: number) {
    cardFeedbackElements.delete(key)
    cardFeedbacks.value = cardFeedbacks.value.filter(entry => entry.key !== key)
  }

  function spawnBannerFeedback(message: string, family: DuelBannerFeedbackFamily) {
    bannerFeedbackKey += 1
    const key = bannerFeedbackKey
    bannerFeedbacks.value = [...bannerFeedbacks.value, {
      key,
      message,
      family
    }]

    nextTick(() => {
      const element = bannerFeedbackElements.get(key)

      if (!element) {
        removeBannerFeedback(key)
        return
      }

      animate(element, getDuelBannerFeedbackAnimation(
        family,
        options.reducedMotion.value === 'reduce',
        () => removeBannerFeedback(key)
      ))
    })
  }

  function removeBannerFeedback(key: number) {
    bannerFeedbackElements.delete(key)
    bannerFeedbacks.value = bannerFeedbacks.value.filter(entry => entry.key !== key)
  }

  function clearTurnFeedbackTimeout() {
    if (turnFeedbackTimeoutHandle !== null) {
      window.clearTimeout(turnFeedbackTimeoutHandle)
      turnFeedbackTimeoutHandle = null
    }
  }

  function showTurnFeedback() {
    clearTurnFeedbackTimeout()
    isTurnFeedbackVisible.value = true
    turnFeedbackTimeoutHandle = window.setTimeout(() => {
      isTurnFeedbackVisible.value = false
      turnFeedbackTimeoutHandle = null
    }, 1500)
  }

  function cardFeedbackClasses(family: DuelCardFeedbackFamily) {
    return resolveDuelFeedbackClasses(options.appConfig, 'card', family)
  }

  function bannerFeedbackClasses(family: DuelBannerFeedbackFamily) {
    return resolveDuelFeedbackClasses(options.appConfig, 'banner', family)
  }

  function setCardFeedbackElement(key: number, value: Element | null) {
    if (value instanceof HTMLElement) {
      cardFeedbackElements.set(key, value)
      return
    }

    cardFeedbackElements.delete(key)
  }

  function setBannerFeedbackElement(key: number, value: Element | null) {
    if (value instanceof HTMLElement) {
      bannerFeedbackElements.set(key, value)
      return
    }

    bannerFeedbackElements.delete(key)
  }

  return {
    bannerFeedbacks,
    cardFeedbacks,
    floatingNumbers,
    isTurnFeedbackVisible,
    bannerFeedbackClasses,
    cardFeedbackClasses,
    clearTurnFeedbackTimeout,
    removeFloatingNumber,
    setBannerFeedbackElement,
    setCardFeedbackElement,
    showTurnFeedback,
    spawnBannerFeedback,
    spawnCardFeedback,
    spawnCardFeedbackAtPosition,
    spawnLifeLossFloatingNumber
  }
}
