# Plan d'implémentation — MVP One Piece TCG

Ce plan découpe `docs/spec.md` en étapes livrables. L'ordre privilégie les fondations techniques, puis les contrats partagés, puis les parcours utilisateur, et enfin la partie temps réel complète.

## Principes de livraison

- Le backend NestJS reste la source de vérité pour l'authentification, les decks, les rooms Colyseus et la structure des parties.
- Le frontend Nuxt reste un client pur : il affiche l'état autorisé, envoie des intentions utilisateur et ne décide jamais seul d'un état de partie faisant autorité.
- Les effets de texte des cartes restent déclaratifs. Toute automatisation dépend uniquement des champs structurés des cartes.
- Les données cachées ne doivent jamais être envoyées au mauvais client, même temporairement dans le state réseau brut.
- Toute nouvelle dépendance doit être validée avec l'utilisateur avant installation.

## Étape 0 — Spike technique

Objectif : valider les briques risquées avant de construire le produit dessus.

État : réalisé. Les preuves sont documentées dans `docs/spikes/step-0-technical-spike.md`.

### Backend

- Créer une preuve d'intégration Better Auth dans NestJS.
- Vérifier la contrainte de body-parser brut pour les routes Better Auth.
- Valider les cookies de session côté API avec une configuration compatible cross-domain.
- Créer une preuve d'intégration Colyseus attachée au serveur HTTP de NestJS.
- Vérifier qu'une room Colyseus peut être créée, rejointe par deux clients et détruite proprement.
- Configurer PostgreSQL avec TypeORM dans le backend.

### Frontend

- Vérifier qu'un client Nuxt peut appeler l'API Nest avec les cookies de session.
- Vérifier qu'un client Nuxt peut se connecter à une room Colyseus exposée par NestJS.

### Validation

- Un endpoint de session répond correctement après authentification de test.
- Deux clients locaux rejoignent la même room Colyseus.
- Une entité TypeORM minimale peut être persistée et relue.

## Étape 1 — Structure du monorepo et contrats partagés

Objectif : installer les frontières de code avant les fonctionnalités.

### Workspace

- Confirmer la structure `packages/api`, `packages/web` et `packages/shared`.
- Configurer les scripts de build, lint et typecheck par package.
- Configurer les imports de `packages/shared` depuis le backend et le frontend.

### Shared

- Définir les types de cartes normalisés : `Card`, `CardType`, couleurs, coûts, puissance, vie, contre, texte, image et édition.
- Définir les types de deck : `Deck`, `DeckCard`, `DeckValidation`.
- Définir le format texte d'import/export : première ligne Leader `1xCARD_ID`, puis cartes du deck au format `QUANTITÉxCARD_ID`.
- Définir les enums d'état de partie : phases, zones, joueur actif, type de cible, statut de combat.
- Définir les contrats d'API REST utiles au frontend.

### Validation

- Le package shared compile seul.
- API et web importent les mêmes types sans duplication locale.
- Les règles de confiance sont documentées : prévalidation possible côté client, revalidation obligatoire côté serveur.

## Étape 2 — Authentification et comptes

Objectif : permettre aux joueurs de posséder une session et des données persistantes.

État : réalisé et audité. Better Auth est monté côté NestJS avec OAuth Google/Discord en production, une persistance PostgreSQL pour Better Auth, un profil joueur TypeORM synchronisé depuis la session, des endpoints `/me` et `/private/auth-check` protégés, et une interface Nuxt de connexion/déconnexion consommant les cookies de session. Un provider email/mot de passe est en plus activé en développement uniquement (`NODE_ENV==='development'`, fail-closed), pour tester l'app sans provider OAuth.

### Backend

- Intégrer Better Auth dans NestJS.
- Activer OAuth Google et Discord en production.
- Activer un provider email/mot de passe uniquement quand `NODE_ENV==='development'`, jamais en production.
- Créer le modèle persistant utilisateur avec TypeORM.
- Exposer les endpoints nécessaires au frontend : session courante, déconnexion, profil minimal.
- Sécuriser les routes qui nécessitent un utilisateur connecté.

### Frontend

- Créer les vues de connexion OAuth.
- Afficher l'état connecté/déconnecté.
- Gérer les erreurs de session expirée.

### Validation

- Un utilisateur peut se connecter via Google ou Discord.
- Un utilisateur reconnecté retrouve son compte existant.
- Les routes privées refusent les requêtes non authentifiées.

## Étape 3 — Source catalogue de cartes

Objectif : rendre les cartes disponibles au deck builder et aux parties.

État : réalisé et audité. Le catalogue expose des types partagés dans `packages/shared`, un module NestJS `/catalog` qui consomme l'API OPTCG officielle (`https://optcgapi.com/api`) avec normalisation et cache local, des endpoints de recherche/filtres/fiche carte, et une tolérance aux familles source partiellement indisponibles. Côté produit, il n'existe pas de page `/catalogue` séparée : la consultation des cartes se fait dans le deck builder `/decks`.

### Backend

- Créer le module catalogue.
- Consommer l'API OPTCG et normaliser les cartes vers le schéma partagé.
- Ajouter un cache local pour limiter les appels externes.
- Exposer les endpoints de recherche, filtre et fiche carte.
- Prévoir les erreurs d'indisponibilité de l'API source.

### Frontend

- Intégrer le catalogue dans l'écran de deck builder.
- Ajouter les filtres MVP : recherche, set, type, couleur, coût.
- Afficher une fiche carte complète dans le deck builder : image, texte, coût, puissance, contre, type et édition.

### Validation

- Le catalogue est consultable depuis le deck builder, sans route `/catalogue` dédiée.
- Les filtres retournent des cartes cohérentes.
- La normalisation fournit tous les champs nécessaires au deck builder et au moteur structurel.

## Étape 4 — Deck builder et persistance des decks

Objectif : permettre à un utilisateur connecté de créer, valider, sauvegarder et partager ses decks depuis une page unique combinant builder et catalogue.

État : réalisé et audité. Les contrats partagés couvrent les decks, la validation et l'import/export texte ; le backend expose un module NestJS `/decks` protégé par session avec entité TypeORM, CRUD propriétaire et validation serveur ; le frontend fournit une page Nuxt `/decks` pour consulter le catalogue intégré, construire, générer un deck complet aléatoire valide, importer/exporter, valider, sauvegarder, modifier et supprimer les decks.

### Backend

- Créer les entités TypeORM pour les decks sauvegardés.
- Implémenter la validation serveur : exactement 1 Leader, 50 cartes hors Leader, maximum 4 exemplaires par numéro, couleurs compatibles avec le Leader.
- Implémenter l'import texte et l'export texte.
- Exposer les endpoints CRUD des decks de l'utilisateur connecté.
- Refuser toute sauvegarde invalide avec des erreurs exploitables côté frontend.

### Frontend

- Créer le deck builder avec sélection du Leader.
- Ajouter et retirer des cartes depuis le catalogue intégré.
- Ajouter une action de génération de deck complet aléatoire qui choisit un Leader disponible, produit 50 cartes hors Leader/DON!! compatibles avec ses couleurs, respecte le plafond de 4 par numéro de carte et laisse le deck modifiable avant sauvegarde.
- Afficher le compteur de cartes, les exemplaires et les erreurs de validation.
- Ajouter les actions importer, exporter, sauvegarder, modifier et supprimer.

### Validation

- Un utilisateur crée un deck valide et le retrouve après reconnexion.
- Un utilisateur peut générer un deck aléatoire complet et valide depuis le catalogue chargé.
- Un deck invalide est bloqué côté client et côté serveur.
- L'import/export texte conserve le contenu du deck.

## Étape 5 — Fondations Colyseus et état de partie

Objectif : créer une room de partie faisant autorité, sans encore couvrir tout le gameplay.

État : réalisé et audité. Les contrats partagés décrivent phases, zones, cartes publiques/privées et logs ; le backend expose une room Colyseus `duel` pour exactement deux joueurs, revalide le deck sauvegardé de chaque joueur, initialise Leader, deck, deck DON!!, main, Vie, terrain et défausse, et filtre les champs privés des zones cachées par client via `StateView`/`@view()` (Colyseus 0.16). Les classes de schema (`DuelState`, `DuelPlayer`, `DuelCard`, etc.) vivent dans `packages/shared` et sont partagées telles quelles entre le serveur et le client (passées en `rootSchema` à `joinOrCreate`/`create`/`joinById`/`reconnect`), ce qui évite la reconstruction par réflexion Colyseus. Le frontend fournit un client Colyseus partagé, une page `/room` minimale pour sélectionner un deck sauvegardé, rejoindre la room, voir les joueurs et les logs, et une page `/zone` (via `DuelBoard.vue`) qui affiche les zones publiques et les compteurs de zones cachées adverses. La reconnexion Colyseus est autorisée pendant 120 secondes avant retrait/forfait structurel.

Correctif notable : un bug bloquant a été identifié et corrigé (2026-07-23) — sous Colyseus 0.15.x/`@colyseus/schema` 2.x, le serveur cessait de rebroadcaster tout patch d'état dès qu'un deuxième joueur rejoignait une room, laissant les deux clients bloqués indéfiniment sur l'écran d'attente. La cause : l'envoi de l'état complet à un joueur qui rejoint effaçait le suivi des changements en attente avant que la diffusion périodique ne notifie les clients déjà connectés. La solution a nécessité une mise à niveau vers Colyseus 0.16.x/`@colyseus/schema` 3.x et le remplacement de `@filter`/`@filterChildren` (supprimés en 0.16) par `StateView`/`@view()`. Un test de sérialisation réseau réel (`@colyseus/testing` + `colyseus.js`, deux clients, assertions sur la visibilité des mains) existe désormais dans `duel-room-serialization.spec.ts` et passe de façon fiable.

### Backend

- Définir les schémas Colyseus partagés : joueurs, zones, cartes publiques, cartes privées, phase, tour, logs d'action.
- Créer une room de duel pour exactement deux joueurs.
- Charger et valider le deck choisi par chaque joueur avant le lancement.
- Initialiser les zones : Leader, deck, deck DON!!, main, Vie, terrain, défausse.
- Masquer correctement la main adverse, le deck adverse et la Vie adverse.
- Ajouter la gestion de reconnexion avec délai avant forfait.

### Frontend

- Créer un client Colyseus partagé.
- Afficher une vue minimale de room avec les deux joueurs et leur état de préparation.
- Afficher les zones publiques et les compteurs de zones cachées.

### Validation

- Deux joueurs entrent dans une room avec un deck valide.
- Chaque joueur voit sa main en clair et seulement les compteurs adverses autorisés.
- Une reconnexion dans le délai restaure l'accès à la partie.

## Étape 6 — Mise en place d'une partie

Objectif : automatiser le setup officiel avant le premier tour.

État : réalisé et audité. Après la jonction des deux joueurs, le backend mélange chaque deck, distribue une main de 5 cartes, désigne aléatoirement un joueur qui choisit de jouer en premier ou en second (`DuelState.startingPlayerSessionId`/`firstPlayerSessionId`), impose un mulligan unique par joueur en commençant par celui qui joue en premier (`DuelPlayer.mulliganDecided`, messages Colyseus `chooseFirstOrSecond`/`mulligan`), puis distribue la Vie selon la valeur du Leader et démarre le tour 1 (`phase` passe de `'mulligan'` à `'refresh'`, `turn=1`, `activePlayerSessionId` posé sur le premier joueur). Côté frontend, `DuelSetupOverlay.vue` affiche l'écran de choix premier/second puis l'interface de mulligan par-dessus le plateau tant que `phase==='mulligan'`, et bascule automatiquement vers l'affichage de partie une fois la mise en place terminée.

### Backend

- Mélanger les decks serveur.
- Déterminer le premier joueur de façon aléatoire.
- Permettre au joueur désigné de choisir premier ou second.
- Distribuer 5 cartes en main.
- Gérer un mulligan unique par joueur, en commençant par le joueur qui joue en premier.
- Générer la Vie selon la valeur du Leader.
- Démarrer le premier tour.

### Frontend

- Créer les écrans et actions de choix premier/second.
- Créer l'interface de mulligan.
- Afficher le passage vers la partie après setup complet.

### Validation

- Le setup suit l'ordre défini par les règles.
- Chaque joueur ne peut faire qu'un mulligan.
- La Vie et la main restent cachées pour l'adversaire.

## Étape 7 — Tour, phases et actions structurelles

Objectif : permettre une partie jouable sans résolution automatique des textes de cartes.

État : réalisé et audité. Après la mise en place (étape 6), le backend fait progresser le tour actif à travers les cinq phases (`refresh` → `draw` → `don` → `main` → `end`) via un message Colyseus `endPhase`, redresse automatiquement le terrain et retourne les DON!! attachés épuisés en zone de Coût en phase de Recharge, applique les exceptions du tout premier tour de chaque joueur (`DuelPlayer.hasTakenFirstTurn` : pas de pioche, 1 seul DON!! au lieu de 2 — l'exception « pas d'attaque » n'a rien à restreindre avant l'étape 8, qui introduit le combat), déclare la défaite par deck-out si la pioche échoue, et expose `playCard` (Personnage/Événement/Lieu, paiement du coût en DON!! redressés, `playedThisTurn`) et `attachDon` (Leader ou Personnage, puissance affichée = base + 1000/DON!!). La limite de 5 Personnages suit la règle structurelle exacte (`docs/optcg-rules.md` §3) : jouer un 6ᵉ Personnage exige de désigner un Personnage déjà en jeu à défausser dans le même message `playCard` (`discardCharacterInstanceId`) plutôt que de bloquer l'action ; le Lieu se remplace de la même façon mais sans choix (un seul Lieu possible). Toute action hors phase, hors tour ou structurellement impossible est rejetée par le serveur avec un message (`actionError`) plutôt que silencieusement ignorée. Côté frontend, `DuelBoard.vue` affiche les DON!! disponibles, un bouton de progression de phase/fin de tour actif seulement quand structurellement possible, un mode "Attacher DON!!" pour cibler Leader/Personnage, un flux de sélection du Personnage à défausser quand la zone est pleine, la puissance calculée en incrustation sur les cartes, et une alerte d'erreur pour les rejets serveur.

### Backend

- Implémenter les phases Recharge, Pioche, DON!!, Principale et Fin.
- Appliquer les exceptions du premier tour : pas de pioche, 1 seul DON!!, pas d'attaque.
- Gérer la pioche et la défaite par deck-out.
- Gérer l'ajout de DON!! depuis le deck DON!! vers la zone de Coût.
- Redresser les cartes en Recharge.
- Retourner les DON!! attachés vers la zone de Coût épuisés.
- Jouer une carte Personnage, Événement ou Lieu depuis la main en payant son coût.
- Respecter les limites de zones : 5 Personnages et 1 Lieu.
- Attacher des DON!! redressés au Leader ou aux Personnages.
- Calculer la puissance affichée : base + 1000 par DON!! attaché.
- Marquer les Personnages joués ce tour-ci avec `playedThisTurn`.

### Frontend

- Créer le plateau complet en deux moitiés.
- Afficher phase, tour actif, DON!! disponibles, cartes épuisées/redressées et puissance calculée.
- Activer les actions seulement quand elles sont structurellement possibles.
- Afficher les rejets serveur sous forme d'erreurs compréhensibles.

### Validation

- Le tour progresse dans le bon ordre.
- Les exceptions du premier tour sont respectées.
- Le serveur rejette les actions hors phase, hors tour ou impossibles.

## Étape 8 — Combat structurel

Objectif : automatiser le combat mécanique sans interpréter les textes de cartes.

État : réalisé et audité. Le backend étend `DuelState` avec un `DuelCombat` partagé (`packages/shared/src/duel-state-schema.ts`) répliqué à tous les clients (pas de donnée cachée dans sa structure), et la room `duel` gère le cycle complet via les messages Colyseus `declareAttack`, `declareBlock`, `declareCounter`, `finishCounterStep` et `resolveTrigger` : ciblage réel validé côté serveur (Leader adverse ou Personnage adverse épuisé, jamais un Personnage joué ce tour-ci ni un attaquant déjà épuisé), étape de Blocage et de Contre purement déclaratives (le serveur ne lit jamais `card_text`), comparaison de puissance automatique (`base + 1000/DON!!` + bonus de Contre déclaré), KO d'un Personnage vaincu vers la Défausse (DON!! attachés retournés épuisés en zone de Coût), et flux de dégât de Vie : défaite immédiate si la Vie est déjà vide, sinon la carte du dessus de la pile de Vie est déplacée en main du défenseur et retournée face visible — elle ne devient lisible pour l'attaquant qu'en tant que compteur de main, jamais en contenu, grâce au mécanisme `StateView`/`client.view.add` déjà en place depuis l'étape 5. Une carte de Vie avec [Déclenchement] met le combat en pause (`awaitingTriggerDecision`) jusqu'à la décision manuelle du défenseur (écarter ou ajouter à la main). Toute action hors étape ou hors rôle (attaquant/défenseur) est rejetée avec `actionError`, y compris `endPhase`/`playCard`/`attachDon` pendant qu'un combat est en cours. Côté frontend, `DuelBoard.vue` ajoute un mode "Attaquer" (sélection de l'attaquant redressé puis de la cible adverse valide, avec incrustations `attackerId`/`isTargetable` sur `PlayZone.vue`), des alertes contextuelles de Blocage/Contre/Déclenchement affichées uniquement au joueur concerné par le rôle (attaquant en attente vs défenseur avec actions), et une saisie de la valeur de Contre avant confirmation. Couvert par 15 tests unitaires (`duel-room-combat.spec.ts`) et un test d'intégration deux-sockets sur le vrai transport Colyseus (`duel-room-serialization.spec.ts`) vérifiant que la carte de Vie révélée reste invisible en contenu pour l'attaquant.

## Étape 9 — Animations et transitions fonctionnelles

Objectif : améliorer la lisibilité du plateau synchronisé par des transitions courtes, utiles et compatibles accessibilité, sans déplacer l'autorité hors du serveur.

État : réalisé et audité. Le frontend combine VueUse (`useTransition`, `usePreferredReducedMotion`) pour l'interpolation de puissance et l'accessibilité, CSS/Tailwind pour les feedbacks continus de ciblage/refus/reconnexion ainsi que pour l'indicateur de phase par badges, et `motion-v` pour les transitions de layout entre zones visibles ainsi que les trajectoires temporaires depuis les zones cachées/condensées (`deck`, `life`, `donDeck`) vers les zones d'arrivée. `PlayZone.vue` anime les cartes publiques via `layout`/`layoutId`, et `DuelBoard.vue` dérive des "ghosts" de transition à partir des snapshots successifs du state Colyseus pour matérialiser une pioche, une perte de Vie révélée ou un ajout de DON!!. Un essai de `UStepper` (Nuxt UI) a été abandonné, le composant étant moins lisible que l'affichage d'origine dans le header. La logique de détection est couverte par `duelTransitions.spec.ts`, et le package `web` repasse `lint`, `typecheck` et les suites de tests ciblées.

### Frontend

- Conserver un indicateur de phase par badges textuels dans le header, avec accent visuel sur la phase active ; l'essai du `Stepper` horizontal Nuxt UI a été retiré pour raisons de lisibilité.
- Ajouter des états visuels continus pour la sélection d'attaquant, le ciblage valide, le Bloqueur potentiel et les zones concernées par une action en cours.
- Ajouter un signal visuel bref lors d'un clic sur une cible invalide, sans s'appuyer uniquement sur les alertes textuelles.
- Interpoler l'affichage de puissance des Leaders et Personnages via VueUse (`useTransition`) tout en respectant `prefers-reduced-motion`.
- Afficher un indicateur persistant d'attente quand l'adversaire est déconnecté dans la fenêtre de reconnexion.
- Animer les déplacements inter-zones et la révélation d'une carte de Vie avec `motion-v`, avec réduction ou désactivation selon `prefers-reduced-motion`.

### Validation

- Les phases du tour restent lisibles sans lecture active d'un simple texte.
- Une carte sélectionnée ou une cible valide est identifiable en continu pendant toute l'action.
- Un clic invalide produit un refus visuel bref, distinct d'une notification classique.
- Les changements de puissance convergent vers la valeur finale en quelques centaines de millisecondes maximum.
- Une déconnexion temporaire adverse laisse une indication d'attente persistante jusqu'au retour ou à la fin de partie.
- Les animations supplémentaires se réduisent ou se coupent quand le système demande moins d'animations.

Correctif notable : un test manuel à deux onglets navigateur (deux comptes réels, room privée par code) a révélé qu'un client dont la connexion Colyseus se rétablit (reconnexion automatique après une coupure brève) pouvait rester bloqué sur une invite de combat obsolète (ex. étape de Blocage déjà résolue côté serveur) jusqu'à la prochaine action, faute de re-rendu immédiat au moment du remplacement de l'instance `Room`. Corrigé dans `useDuelRoom.ts` : le `watch(room, ...)` force désormais un incrément de la version réactive dès qu'une nouvelle instance `Room` est assignée (reconnexion), sans attendre le prochain patch entrant.

### Backend

- Déclarer une attaque avec Leader ou Personnage redressé.
- Interdire l'attaque d'un Personnage joué ce tour-ci.
- Valider les cibles : Leader adverse ou Personnage adverse épuisé.
- Épuiser l'attaquant.
- Gérer l'étape de Blocage déclarative : le défenseur peut désigner un Personnage comme bloqueur, sans vérification du texte.
- Gérer l'étape de Contre déclarative : le défenseur peut défausser une carte et déclarer une valeur de contre.
- Comparer les puissances finales.
- Mettre KO un Personnage vaincu.
- Gérer les dégâts au Leader : Vie vide = défaite, sinon révélation uniquement au défenseur.
- Permettre au défenseur de déclarer manuellement un Trigger, puis écarter la carte ou l'ajouter à sa main.
- Terminer le combat et revenir à la phase Principale.

### Frontend

- Créer les interactions de sélection attaquant/cible.
- Créer les prompts de Blocage, Contre et Trigger pour le défenseur.
- Afficher les logs d'action pour synchroniser les joueurs.
- Garder les cartes révélées privées quand la règle l'exige.

### Validation

- Une cible invalide est rejetée serveur.
- La comparaison de puissance donne le bon résultat.
- Les dégâts sur la Vie ne révèlent la carte qu'au défenseur.
- La partie se termine correctement sur Vie vide plus dégât.

## Étape 10 — Matchmaking et lobby

Objectif : permettre aux joueurs de démarrer des parties via file publique ou code privé.

État : réalisé et audité. La file aléatoire (`joinOrCreate`) et les rooms par code (`create`/`joinById`) existaient déjà côté room `duel` (étape 5) ; l'ajout de cette étape 10 est la lobby décrite. `DuelRoom.onCreate` accepte une `description` optionnelle dans les options de création et appelle `this.setMetadata({ description })` (`packages/api/src/realtime/duel.room.ts`) sans jamais l'interpréter ; les rooms sans description restent des rooms privées/rapides ordinaires, invisibles de la liste. `packages/api/src/realtime/lobby.ts` expose `listDescribedDuelRooms()` (interrogeant `matchMaker.query({ name: 'duel' })`, filtré sur non verrouillée, non complète, et `metadata.description` non vide) consommé par `GET /lobby/rooms` (`LobbyController`, protégé par `AuthGuard`). Le cycle de vie natif de Colyseus (verrouillage à 2 joueurs via `initializeGame()`, suppression du listing à la déconnexion/dispose) suffit à faire disparaître une room décrite dès qu'elle est complète ou abandonnée, sans nettoyage manuel supplémentaire. Côté frontend, `packages/web/app/pages/room.vue` ajoute un champ de description optionnel à la création de room privée et un bloc dédié "Lobbies décrites" (description, occupation, bouton rejoindre, rafraîchissement manuel via `GET /lobby/rooms`). Couvert par 3 tests d'intégration deux-sockets sur le vrai transport Colyseus dans `duel-room-serialization.spec.ts` (apparition uniquement si décrite, disparition une fois complète, disparition une fois abandonnée), et vérifié manuellement en navigateur avec trois comptes de test isolés : hébergement décrit, apparition après rafraîchissement manuel chez un autre utilisateur, jonction depuis la liste, puis disparition de la liste une fois la room complète — la file aléatoire (`joinOrCreate`) reste elle non listée comme attendu.

### Backend

- Créer une file d'attente aléatoire par ordre d'arrivée.
- Créer et rejoindre une room par code partageable.
- Associer chaque entrée de lobby à un deck sauvegardé valide.
- Nettoyer les entrées de queue et rooms abandonnées.
- 🆕 Lobby décrite : permettre l'hébergement d'une room `duel` publique avec une description libre attachée en métadonnée (ex: `room.setMetadata({ description })` à la création), sans jamais interpréter cette description côté serveur.
- 🆕 Exposer un moyen de lister les rooms publiques décrites avec leur métadonnée (ex: endpoint basé sur `matchMaker.query`/`getAvailableRooms` filtré sur `name: 'duel'` et présence d'une description), en excluant les rooms déjà complètes (2 joueurs) ou verrouillées/abandonnées.

### Frontend

- Créer le lobby de sélection de deck.
- Ajouter les actions rejoindre la file, quitter la file, créer une room privée, rejoindre par code.
- Afficher les états d'attente et d'erreur.
- 🆕 Ajouter un champ de description libre à la création d'une room, pour l'hébergement en lobby décrite.
- 🆕 Ajouter dans `packages/web/app/pages/room.vue` un bloc dédié listant les lobbies décrites disponibles (description, occupation 1/2, action rejoindre), avec un bouton de rafraîchissement manuel (pas de synchronisation live obligatoire).

### Validation

- Deux joueurs sont appariés via la file aléatoire.
- Deux joueurs rejoignent une partie via un code.
- Un joueur sans deck valide ne peut pas entrer en partie.
- 🆕 Un utilisateur peut héberger une lobby avec une description ; celle-ci apparaît, avec sa description, dans le bloc dédié de `/room` chez un autre utilisateur qui rafraîchit la liste, et ce dernier peut la rejoindre depuis cette entrée.
- 🆕 Une lobby décrite disparaît de la liste une fois complète (2 joueurs) ou abandonnée.

## Étape 11 — Finition MVP

Objectif : rendre l'expérience complète, robuste et testable.

### Backend

- Ajouter les tests unitaires des validateurs de deck.
- Ajouter les tests unitaires du moteur structurel : phases, DON!!, zones, ciblage, combat, dégâts, deck-out.
- Ajouter les tests e2e des endpoints auth/decks/lobby.
- Vérifier les logs et erreurs serveur.
- Documenter les variables d'environnement nécessaires.

### Frontend

- Vérifier les parcours : connexion, deck builder avec catalogue intégré, lobby, partie.
- Ajouter les états de chargement, vide et erreur.
- Vérifier le responsive du plateau et des écrans de gestion.
- S'assurer que l'interface n'affiche aucune option hors périmètre v1.

### Validation

- Les commandes de build, lint et typecheck passent pour les packages concernés.
- Une partie complète peut être jouée de bout en bout entre deux utilisateurs.
- Les critères d'acceptation de `docs/spec.md` sont tous couverts.

## Étape 12 — Drag and drop main vers zone Personnage

Objectif : ajouter une interaction directe de glisser-déposer pour jouer un Personnage depuis la main pendant la phase Principale, sans sortir du modèle d'autorité serveur.

### Frontend

- Ajouter une interaction de drag and drop depuis la main du joueur actif vers sa zone Personnage.
- Limiter le démarrage du drag aux cartes de type Personnage jouables dans le contexte courant, ou afficher immédiatement un refus visuel si la carte n'est pas éligible.
- Mettre en évidence la zone Personnage du joueur actif comme cible de drop uniquement pendant sa phase Principale.
- Préserver le comportement existant de clic comme solution de repli, pour clavier, mobile ou en cas d'échec du drag.
- Gérer le cas de la 6e carte Personnage via le même flux que l'action existante de remplacement obligatoire, sans contourner la sélection de la carte à défausser.
- Annuler proprement le geste si le drop a lieu hors de la zone valide, sans déplacer la carte de façon optimiste dans l'état local.

### Backend

- Réutiliser la validation existante de `playCard` : type de carte, phase active, joueur actif, coût payable, limites de zone et remplacement éventuel.
- Continuer à rejeter côté serveur toute tentative hors phase Principale ou structurellement invalide, même si le client a autorisé le drag.

### Validation

- En phase Principale, glisser-déposer un Personnage depuis la main vers la zone Personnage déclenche bien l'action de jeu normale et aboutit au même état final qu'un clic.
- Hors phase Principale, avec une carte non-Personnage, avec un coût insuffisant ou vers une mauvaise zone, le drag and drop n'introduit aucun état local incohérent et l'action n'est pas exécutée.
- Le flux reste utilisable sur mobile et au clavier grâce au fallback existant sans drag and drop.

## Hors périmètre à ne pas implémenter en v1

- Résolution automatique des textes d'effets.
- Moteur de scripting par carte.
- Classement, MMR ou saisons compétitives.
- Spectateur, replay ou historique détaillé.
- Chat en partie.
- Mode tournoi ou bracket.
- Achats, boutique ou monétisation.
