<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <UPageHero
      title="Le simulateur One Piece TCG le plus rapide"
      description="Construis tes decks, affronte d'autres joueurs en temps réel, et découvre l'expérience complète du One Piece Trading Card Game."
      :links="[{ label: 'Commencer', to: '/lobby', size: 'xl', class: 'text-lg' }]"
    >
      <template #headline>
        <UBadge
          color="primary"
          variant="subtle"
          icon="i-lucide-shield-check"
          size="lg"
        >
          Simulateur One Piece TCG
        </UBadge>
      </template>
    </UPageHero>

    <!-- How it works Section -->
    <UPageSection>
      <template #title>
        Jouer en 3 étapes simples
      </template>

      <div class="grid gap-8 md:grid-cols-3">
        <UPageCard
          title="Connecte-toi"
          description="Utilise ton compte Google ou Discord pour accéder à ton profil et sauvegarder tes decks."
        >
          <template #icon>
            <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
              1
            </div>
          </template>
        </UPageCard>

        <UPageCard
          title="Construis ton deck"
          description="Utilise le deck builder avec le catalogue complet des cartes pour créer des decks valides."
        >
          <template #icon>
            <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
              2
            </div>
          </template>
        </UPageCard>

        <UPageCard
          title="Affronte tes adversaires"
          description="Rejoins une file d'attente ou crée une room par code pour jouer en temps réel."
        >
          <template #icon>
            <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
              3
            </div>
          </template>
        </UPageCard>
      </div>
    </UPageSection>

    <!-- Features Section -->
    <UPageSection>
      <template #title>
        Tout ce que tu dois savoir
      </template>

      <div class="grid gap-8 md:grid-cols-2">
        <UPageFeature
          title="Deck Builder Complet"
          description="Accès au catalogue complet des cartes One Piece TCG avec filtres avancés, validation automatique des règles de construction, et génération de decks aléatoires."
          icon="i-lucide-layers"
        />

        <UPageFeature
          title="Matchmaking Flexible"
          description="File d'attente aléatoire pour jouer contre des joueurs du monde entier, ou code de room privé pour affronter tes amis."
          icon="i-lucide-users"
        />

        <UPageFeature
          title="Simulateur Assisté"
          description="Plateau synchronisé qui gère automatiquement les règles structurelles (phases, DON!!, zones, combat) pendant que tu appliques les effets des cartes."
          icon="i-lucide-gamepad-2"
        />

        <UPageFeature
          title="Information Cachée Sécurisée"
          description="Le serveur garantit que l'information cachée (main adverse, cartes Vie) reste réellement cachée pour une expérience de jeu équitable."
          icon="i-lucide-shield-check"
        />
      </div>
    </UPageSection>

    <!-- CTA Section -->
    <UPageCTA
      title="Prêt à jouer ?"
      description="Rejoins des milliers de joueurs et construis ton légendaire deck One Piece TCG."
      :links="[{ label: 'Commencer maintenant', to: '/lobby', size: 'xl', color: 'neutral', variant: 'solid', class: 'text-lg' }]"
    />
  </div>
</template>
