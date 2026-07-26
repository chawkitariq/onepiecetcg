<script setup lang="ts">
import { animate } from 'animejs'
import donCard from '~/assets/don.png'
import cardBack from '~/assets/card-back-regular.png'

const heroLinks = [
  { label: 'Commencer', to: '/lobby', size: 'xl' as const, class: 'text-base font-semibold' },
  { label: 'Voir le deck builder', to: '/decks', size: 'xl' as const, color: 'neutral' as const, variant: 'subtle' as const, class: 'text-base' }
]

const steps = [
  {
    number: '01',
    title: 'Connecte-toi',
    description: 'Un compte Google ou Discord suffit pour retrouver ton profil et tes decks sauvegardés d\'une session à l\'autre.',
    icon: 'i-lucide-log-in'
  },
  {
    number: '02',
    title: 'Construis ton deck',
    description: 'Choisis un Leader, complète tes 50 cartes depuis le catalogue complet, ou génère un deck aléatoire valide en un clic.',
    icon: 'i-lucide-layers'
  },
  {
    number: '03',
    title: 'Entre en jeu',
    description: 'File d\'attente aléatoire, code de room entre amis, ou lobby publique décrite : choisis ton adversaire et lance la partie.',
    icon: 'i-lucide-swords'
  }
]

const features = [
  {
    title: 'Deck builder complet',
    description: 'Catalogue officiel filtrable par set, couleur, coût et type, plafond de 4 exemplaires respecté automatiquement, et génération de deck aléatoire valide en un clic.',
    icon: 'i-lucide-layers'
  },
  {
    title: 'Matchmaking flexible',
    description: 'File d\'attente aléatoire, code de room privé entre amis, ou lobby publique avec description libre pour trouver le bon adversaire.',
    icon: 'i-lucide-users'
  },
  {
    title: 'Arbitre structurel automatique',
    description: 'Phases, DON!!, zones, ciblage d\'attaque et résolution de combat gérés côté serveur — le texte des cartes reste entre tes mains, comme sur un vrai plateau.',
    icon: 'i-lucide-gamepad-2'
  },
  {
    title: 'Information cachée respectée',
    description: 'Main adverse et cartes de Vie jamais exposées côté client, même dans le trafic réseau brut : le serveur ne triche pas avec l\'information cachée.',
    icon: 'i-lucide-eye-off'
  }
]

const reducedMotion = usePreferredReducedMotion()
const heroVisual = useTemplateRef<HTMLElement>('hero-visual')
const heroBadge = useTemplateRef<HTMLElement>('hero-badge')

onMounted(() => {
  if (reducedMotion.value === 'reduce') {
    if (heroVisual.value) {
      heroVisual.value.style.opacity = '1'
      heroVisual.value.style.transform = 'translateY(0) rotate(-6deg)'
    }

    if (heroBadge.value) {
      heroBadge.value.style.opacity = '1'
      heroBadge.value.style.transform = 'scale(1)'
    }

    return
  }

  if (heroVisual.value) {
    animate(heroVisual.value, {
      opacity: [0, 1],
      y: [40, 0],
      rotate: [-14, -6],
      duration: 700,
      ease: 'outCubic'
    })
  }

  if (heroBadge.value) {
    animate(heroBadge.value, {
      opacity: [0, 1],
      scale: [0.7, 1],
      delay: 450,
      duration: 500,
      ease: 'outBack'
    })
  }
})
</script>

<template>
  <div class="min-h-screen overflow-hidden">
    <!-- Hero Section -->
    <div class="relative isolate overflow-hidden bg-[#12153a]">
      <div
        class="pointer-events-none absolute inset-0 opacity-40"
        style="background-image: radial-gradient(circle at 15% 20%, rgba(212,175,55,0.18), transparent 45%), radial-gradient(circle at 85% 0%, rgba(0,220,130,0.14), transparent 40%)"
      />
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.06]"
        style="background-image: repeating-linear-gradient(120deg, #d4af37 0px, #d4af37 1px, transparent 1px, transparent 140px), repeating-linear-gradient(60deg, #d4af37 0px, #d4af37 1px, transparent 1px, transparent 140px)"
      />

      <UPageHero
        orientation="horizontal"
        title="Le pont t'attend."
        description="Construis ton deck, appelle tes DON!!, et affronte d'autres joueurs en temps réel dans le simulateur One Piece TCG le plus rapide pour jouer entre amis ou en ligne."
        :links="heroLinks"
        :ui="{
          title: 'text-white',
          description: 'text-slate-300',
          container: 'py-20 sm:py-28 lg:py-32'
        }"
      >
        <template #headline>
          <UBadge
            color="warning"
            variant="subtle"
            icon="i-lucide-anchor"
            size="lg"
            class="border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#e8c766]"
          >
            Simulateur One Piece TCG — temps réel
          </UBadge>
        </template>

        <div
          ref="hero-visual"
          class="hero-card-visual relative mx-auto w-56 sm:w-64 lg:w-72"
        >
          <div
            class="absolute -inset-6 rounded-[2rem] opacity-60 blur-2xl"
            style="background: radial-gradient(circle, rgba(212,175,55,0.35), transparent 70%)"
          />
          <img
            :src="donCard"
            alt="Carte DON!! — +1000 puissance pendant ton tour"
            class="relative w-full rounded-2xl shadow-2xl ring-1 ring-[#d4af37]/40"
          >
          <div
            ref="hero-badge"
            class="hero-card-badge absolute -right-4 -top-4 flex items-center gap-1 rounded-full bg-[#d4af37] px-3 py-1.5 text-sm font-bold text-[#12153a] shadow-lg sm:-right-6 sm:-top-6"
          >
            <UIcon
              name="i-lucide-zap"
              class="size-4"
            />
            +1000
          </div>
        </div>
      </UPageHero>
    </div>

    <!-- How it works Section -->
    <UPageSection>
      <template #headline>
        Trois étapes
      </template>
      <template #title>
        Du menu à la partie, en quelques minutes
      </template>

      <div class="grid gap-8 md:grid-cols-3">
        <div
          v-for="step in steps"
          :key="step.number"
          class="relative rounded-2xl border border-default bg-elevated/40 p-6"
        >
          <span class="pointer-events-none absolute right-4 top-2 font-mono text-5xl font-black text-muted/10">
            {{ step.number }}
          </span>
          <div class="relative flex items-center gap-3">
            <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UIcon
                :name="step.icon"
                class="size-5"
              />
            </div>
            <h3 class="text-lg font-semibold text-highlighted">
              {{ step.title }}
            </h3>
          </div>
          <p class="relative mt-4 text-[15px] text-muted">
            {{ step.description }}
          </p>
        </div>
      </div>
    </UPageSection>

    <!-- Features Section -->
    <div class="relative isolate overflow-hidden bg-[#12153a]">
      <div
        class="pointer-events-none absolute inset-0 opacity-30"
        style="background-image: radial-gradient(circle at 90% 90%, rgba(212,175,55,0.16), transparent 45%)"
      />

      <UPageSection
        :ui="{
          title: 'text-white',
          description: 'text-slate-300'
        }"
      >
        <template #headline>
          <span class="text-[#e8c766]">Sous le capot</span>
        </template>
        <template #title>
          Un arbitre fidèle aux règles, jamais dans ton chemin
        </template>

        <div class="grid gap-x-8 gap-y-10 sm:grid-cols-2">
          <UPageFeature
            v-for="feature in features"
            :key="feature.title"
            :title="feature.title"
            :description="feature.description"
            :icon="feature.icon"
            :ui="{
              title: 'text-white',
              description: 'text-slate-400',
              leadingIcon: 'text-[#e8c766]'
            }"
          />
        </div>
      </UPageSection>
    </div>

    <!-- CTA Section -->
    <UPageSection :ui="{ container: 'py-16 sm:py-20 lg:py-24' }">
      <UPageCTA
        title="Prêt à hisser les voiles ?"
        description="Construis ton deck, invite un ami avec un code de room ou lance-toi dans la file d'attente — ta prochaine partie t'attend."
        orientation="horizontal"
        :links="[{ label: 'Commencer maintenant', to: '/lobby', size: 'xl', color: 'neutral', variant: 'solid', class: 'text-base font-semibold' }]"
        class="overflow-hidden bg-[#12153a] ring-1 ring-[#d4af37]/20"
        :ui="{ title: 'text-white', description: 'text-slate-300' }"
      >
        <img
          :src="cardBack"
          alt=""
          aria-hidden="true"
          class="mx-auto w-40 rotate-3 rounded-xl shadow-xl ring-1 ring-[#d4af37]/30 sm:w-48"
        >
      </UPageCTA>
    </UPageSection>
  </div>
</template>

<style scoped>
.hero-card-visual {
  opacity: 0;
  transform: translateY(40px) rotate(-14deg);
}

.hero-card-visual:hover,
.hero-card-visual:focus-within {
  transform: translateY(0) rotate(-2deg) scale(1.03);
}

.hero-card-badge {
  opacity: 0;
  transform: scale(0.7);
}

@media (prefers-reduced-motion: reduce) {
  .hero-card-visual,
  .hero-card-badge {
    opacity: 1;
    transform: none !important;
  }
}
</style>
