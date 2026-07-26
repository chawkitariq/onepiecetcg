# Fonctionnalités MVP — Simulateur One Piece TCG (v6, multijoueur en ligne, effets déclaratifs)

## Objectif du MVP

Simulateur One Piece TCG multijoueur en ligne, avec constitution de deck, comptes utilisateurs persistants, et parties jouées en temps réel contre un adversaire humain. Le serveur fait autorité sur la **structure** de la partie (zones, phases, tour, ciblage, limites, information cachée) mais **pas** sur la résolution du texte des cartes : les effets restent appliqués manuellement par les joueurs, comme dans un simulateur assisté (type Cockatrice/Tabletop Simulator pour Magic), pas comme un arbitre numérique complet.

Ce document réutilise ce qui reste valable des versions précédentes : le schéma de données carte normalisé, la logique de deck builder (couleur, plafond de 4, 50 cartes), le séquencement de tour et ses exceptions (1er tour), les limites de zones (5 Personnages, 1 Lieu). Ce qui change par rapport au solo (v1-v4) : la gestion réelle de l'information cachée entre deux clients, la synchronisation temps réel, et l'authentification.

## Décisions produit actées

- **Matchmaking** : aléatoire (file d'attente publique) **et** code de partie / lien d'invitation — les deux coexistent.
- **Moteur de règles** : arbitre **structurel** côté serveur (zones, phases, ciblage, limites, information cachée) ; **les effets de texte des cartes restent déclaratifs**, appliqués manuellement par les joueurs — pas de moteur de scripting par carte.
- **Comptes utilisateurs** : oui, persistants, avec sauvegarde de decks entre sessions.
- **Stack technique retenue** :
  - **Backend : NestJS** — fait autorité sur tout : API REST (comptes, decks), authentification, et hébergement du serveur temps réel.
  - **Frontend : Nuxt** — client pur, consomme l'API Nest et se connecte au serveur temps réel ; ne porte aucune logique d'autorité (ni auth, ni état de partie).
  - **Authentification : Better Auth, monté côté NestJS** (intégration communautaire — `@thallesp/nestjs-better-auth` ou équivalent — pas encore une intégration officielle Nest, contrairement à Nuxt qui en a une de première classe). Points d'attention techniques :
    - Désactiver le body-parser par défaut de Nest pour laisser Better Auth traiter les requêtes brutes.
    - Cookies de session en cross-domain entre Nest et Nuxt : prévoir des sous-domaines du même domaine parent en production (ex: `api.tondomaine.com` / `app.tondomaine.com`) avec un réglage `SameSite` cohérent, sinon la session ne circule pas correctement entre les deux services.
  - **Temps réel : Colyseus, attaché manuellement au serveur HTTP exposé par NestJS** (pas d'intégration officielle Nest non plus — nécessite un module Nest dédié qui relie l'instance Colyseus au serveur HTTP sous-jacent au démarrage).
  - **Persistance : PostgreSQL avec TypeORM** (comptes, decks), distincte de l'état de partie éphémère géré en mémoire par Colyseus.
  - **Organisation : monorepo pnpm** — voir §0 pour la structure des packages.

## Référence d'inspiration : OPTCG Sim

Ce projet s'inspire d'[OPTCG Sim](https://optcgsim.com/), le simulateur non-officiel de référence pour le One Piece TCG (client fan-made par Maebatsu, plutôt qu'une web app). Deux points confirmés par cette référence :

- **Matchmaking double** (file aléatoire classée par MMR + "Private Mode" entre amis) — confirme notre choix de proposer les deux modes de mise en relation.
- **Deck builder complet et central** dans l'expérience — cohérent avec la priorité déjà donnée à cette brique.

Un point volontairement **non repris pour ce MVP** : OPTCG Sim propose un classement/MMR dès son cœur d'expérience ; ce projet le garde en v2 (voir "Hors périmètre v1"), pour rester sur un MVP de parties casuelles sans système de progression/classement au lancement.

## 0. Structure du dépôt

Monorepo pnpm (workspaces), organisé ainsi :

```
packages/
  api/       # NestJS — backend faisant autorité (auth, REST, Colyseus)
  web/       # Nuxt — client pur (UI, aucune logique d'autorité)
  shared/    # types et schémas partagés entre api et web
```

🎯 **`packages/shared`** : à prévoir dès le départ pour héberger les types qui doivent être identiques des deux côtés, plutôt que dupliqués et sujets à divergence :
- Le schéma de carte normalisé (`Card`, `CardType`, `normalizeCard`), le type `Deck`/`DeckCard`/`DeckValidation`, et le parsing du format texte d'import/export (§4/§6bis du schéma de données) — utile côté `web` pour valider/prévisualiser un deck avant envoi, et côté `api` pour la validation faisant autorité.
- Les schémas de `State` Colyseus (zones, `CardInstance`, phases) — Colyseus permet un typage partagé client/serveur, à exploiter ici pour éviter que `web` et `api` dérivent avec des définitions incompatibles de l'état de partie.
- Les types de requêtes/réponses de l'API REST (contrats d'endpoints), si un client HTTP typé est généré ou écrit à la main.

Ce que `shared` ne doit **pas** contenir : toute logique qui doit rester strictement côté serveur pour des raisons de confiance/sécurité (validation finale de deck, résolution de combat structurelle) — le code peut être partagé pour la prévisualisation côté client, mais l'exécution qui fait autorité reste uniquement dans `packages/api`. Dupliquer un validateur en `shared` pour un usage d'aperçu côté client est acceptable ; lui faire confiance côté serveur sans revalidation ne l'est pas.

## 1. Principe d'architecture

Deux types d'état, à ne pas confondre :

- **État persistant** (PostgreSQL) : comptes utilisateurs, decks sauvegardés. Survit entre les sessions.
- **État de partie éphémère** (Colyseus, en mémoire serveur, une "room" par partie) : plateau, mains, zones, phases, tour en cours. N'existe que le temps de la partie ; à la fin, seul un éventuel résumé (score, résultat) peut être persisté si souhaité en v2+.

**Le serveur est la seule source de vérité.** Les clients ne reçoivent que la vue qui leur est autorisée (leur propre main en clair, la main adverse masquée en nombre de cartes uniquement, les cartes de Vie face cachée des deux côtés). Aucune donnée cachée ne doit transiter vers un client qui n'est pas censé la voir, même dans le state réseau brut — sinon un joueur inspectant le trafic réseau pourrait tricher.

## 2. Authentification et comptes

- Authentification gérée par **Better Auth, monté dans le backend NestJS** — Nuxt n'implémente aucune logique d'auth, il consomme les endpoints exposés par Nest et relaie les cookies de session.
- 🎯 **Uniquement OAuth Google et Discord en production** — pas d'autre fournisseur prévu pour le MVP. Décision actée, pas une option ouverte à extension "si souhaité plus tard".
- **Exception dev-only** : un provider Better Auth email/mot de passe est activé uniquement quand `NODE_ENV==='development'` (fail-closed — toute autre valeur, y compris absente ou mal configurée, le désactive), pour permettre aux contributeurs de tester l'app sans dépendre d'un provider OAuth externe. Jamais disponible en production ; ne change rien au modèle de compte ni aux critères d'acceptation ci-dessous, qui restent OAuth-only.
- Un compte possède : un pseudonyme affiché, une liste de decks sauvegardés.
- Aucun système de mot de passe interne à gérer en production (entièrement délégué à Google/Discord) — réduit la surface de risque sécurité et simplifie le schéma de compte (pas de champ mot de passe, pas de flux de reset, pas de vérification d'email à gérer).
- Export/import au format texte du deck (§4) conservé en plus du stockage compte, pour le partage et la sauvegarde externe.

## 3. Moteur de règles structurel (pas de scripting d'effets)

Cette couche est le seul moteur de règles du MVP. Elle repose uniquement sur les champs structurés du schéma de carte (`cost`, `power`, `life`, `type`, `colors`) — jamais sur le texte libre (`card_text`), qui reste affiché mais jamais interprété automatiquement.

Fonctions attendues :
- Mélange, pioche, mulligan (un par joueur), génération de la zone Vie selon le Leader.
- Détermination du premier joueur (aléatoire), avec choix de jouer en premier ou en second.
- Progression des 5 phases (Recharge, Pioche, DON!!, Principale, Fin), avec exceptions du 1er tour du joueur qui commence (1 seul DON!!, pas de pioche, pas d'attaque).
- Placement des DON!! (2 par tour standard), redressement automatique en phase de Fin.
- Puissance affichée = base + 1000/DON!! attachée, calculée automatiquement.
- Limites de zones : 5 Personnages max, 1 Lieu max (remplacement automatique).
- Un Personnage joué ce tour-ci ne peut pas attaquer (`playedThisTurn`).
- **Ciblage d'attaque réel** : le serveur valide que la cible est le Leader adverse ou un Personnage adverse épuisé — un ciblage invalide est rejeté côté serveur, pas seulement grisé côté UI.
- **Étape de Blocage déclarative** : le défenseur peut désigner une carte de sa zone Personnage comme Blocker au moment de l'attaque ; le serveur ne vérifie pas que la carte possède réellement l'effet *Blocker* dans son texte — c'est au joueur de le faire honnêtement, comme sur un vrai plateau. La carte désignée prend structurellement la place de la cible pour la comparaison de puissance.
- **Étape de Contre déclarative** : le défenseur peut défausser une carte de sa main en déclarant une valeur de Contre ; le serveur ajoute cette valeur à la puissance de défense sans vérifier le texte de la carte défaussée.
- **Résolution de combat structurelle** : comparaison de puissance (calcul automatique), KO d'un Personnage (déplacement en Défausse), déclenchement du flux de dégât de Vie côté Leader — tout ceci est mécanique et ne dépend d'aucun texte d'effet.
- **Flux de dégât sur la Vie** : la carte du dessus de la pile de Vie est retirée côté serveur et révélée **uniquement au joueur défenseur**. Celui-ci déclare manuellement si un effet Trigger s'applique (le serveur ne lit pas le texte) ; s'il l'active, la carte est écartée, sinon elle rejoint sa main.
- Conditions de fin de partie : Vie à zéro (le Leader subit un dégât alors que sa Vie est déjà vide) et deck-out — les deux déclenchent une défaite immédiate.
- Gestion de la reconnexion : si un joueur perd sa connexion, la room doit survivre un délai raisonnable (ex: 2 minutes) avant de déclarer forfait, pour absorber les coupures réseau temporaires.

**Principe directeur inchangé du solo, maintenant appliqué à deux joueurs** : *si une donnée peut être calculée à partir des champs structurés du schéma, elle est automatisée côté serveur ; si elle nécessite de lire `card_text`, elle reste déclarative — chaque joueur applique lui-même les effets de ses cartes et de celles de son adversaire, sur la base de la confiance mutuelle, comme autour d'une vraie table.* Le serveur garantit uniquement que les deux joueurs voient le même état structurel synchronisé et que l'information cachée reste réellement cachée — pas que le texte des cartes est correctement appliqué.

## 4. Deck builder avec catalogue intégré

Repris et adapté des versions précédentes :
- Une seule page utilisateur de construction de deck (`/decks`) intègre le catalogue filtrable (recherche, set, type, couleur, coût). Il n'y a pas de page `/catalogue` séparée dans le produit.
- Le catalogue intégré utilise l'API OPTCG officielle (`https://optcgapi.com/api`), avec cache local pour limiter les appels.
- Le backend consomme les familles documentées séparément (`/allSetCards/`, `/allSTCards/`, `/allPromoCards/`, `/allDonCards/`) et normalise toutes les réponses vers le schéma partagé. Si une famille optionnelle de l'API source est temporairement indisponible ou diverge de la documentation, le catalogue intégré ne doit pas tomber entièrement tant qu'au moins une source exploitable répond ; il doit servir le cache existant si possible, sinon retourner une erreur explicite d'indisponibilité.
- La normalisation doit tenir compte des champs réellement exposés par OPTCG API, notamment `card_set_id`, `card_name`, `set_id`, `set_name`, `card_text`, `card_color`, `card_type`, `life`, `card_cost`, `card_power`, `counter_amount`, `attribute`, `sub_types`, `rarity` et `card_image`. Le schéma partagé garde des noms stables et indépendants de la source (`number`, `name`, `set`, `text`, `colors`, `type`, `life`, `cost`, `power`, `counter`, `attributes`, `families`, `rarity`, `imageUrl`).
- Fiche carte complète depuis le deck builder (image, texte, coût, puissance, contre, type, édition).
- Deck builder central : sélection Leader, ajout/retrait de cartes depuis le catalogue intégré, 50 cartes, plafond de 4 exemplaires, validation de couleur vs Leader.
- Génération de deck complet aléatoire depuis le deck builder : l'utilisateur peut créer un nouveau deck non sauvegardé automatiquement, avec un Leader choisi aléatoirement parmi les Leaders disponibles et 50 cartes hors Leader/DON!! compatibles avec ses couleurs. Le générateur doit respecter les règles de construction standard (50 cartes, maximum 4 exemplaires par numéro de carte, aucune couleur absente du Leader) et ne doit proposer aucun deck qui échouerait à la validation serveur. Si le catalogue chargé ne contient pas assez de cartes compatibles pour construire un deck complet, l'interface affiche une erreur explicite plutôt qu'un deck partiel.
- 🆕 **Decks liés au compte utilisateur** (persistés en base), avec **import/export au format texte ligne par ligne** (`QUANTITÉxCARD_ID`, ex: `4xST01-003`) conservé en complément — format standard du milieu, facilement partageable entre joueurs (Discord, forums) sans dépendre d'un fichier JSON. La première ligne représente toujours le Leader (`1xCARD_ID`). Voir le schéma de données pour la spécification complète du parsing et de la validation.

## 5. Matchmaking et lobby

- File d'attente aléatoire : appariement simple par ordre d'arrivée pour le MVP (pas de MMR/elo au départ).
- Génération de code de room partageable, pour jouer contre un ami spécifique.
- Écran de lobby : sélection du deck à utiliser pour la partie parmi ceux sauvegardés sur le compte, avant d'entrer en file d'attente ou de créer/rejoindre une room par code.
- 🆕 **Lobby décrite (hébergement public avec description)** : en plus de la file aléatoire et du code privé, un joueur peut héberger une room **publique et listée**, accompagnée d'une courte description libre (ex: "Débutant bienvenu", "Format événement uniquement", "Cherche partie tranquille"). Cette description sert de filtre humain, pas structurel : le serveur ne l'interprète jamais, il la stocke et la diffuse telle quelle — c'est au joueur intéressé de lire la description et de décider de rejoindre en conséquence, exactement comme le texte des cartes reste déclaratif (§3).
  - Le serveur expose la liste des rooms hébergées de cette façon (room Colyseus `duel` marquée publique avec métadonnée `description`), interrogeable par les autres clients — via une requête au matchmaking Colyseus (ex: `matchMaker.query`/`getAvailableRooms` côté API) exposée par un endpoint dédié, ou tout mécanisme équivalent exposant les rooms publiques avec leur métadonnée.
  - Chaque entrée listée affiche a minima : la description fournie par l'hôte, un identifiant de room permettant de la rejoindre, et le nombre de joueurs déjà présents (1/2 en attente).
  - La liste n'est pas poussée en temps réel obligatoirement : un rafraîchissement manuel côté client (bouton "Actualiser") est suffisant pour le MVP — pas de garantie de synchronisation live requise.
  - Rejoindre une lobby décrite depuis la liste suit les mêmes règles qu'un rejoint par code (deck valide requis, capacité de 2 joueurs max, mêmes règles de setup de partie) ; seule la découverte diffère (liste parcourable au lieu d'un code transmis hors bande).
  - Une room décrite disparaît de la liste dès qu'elle est complète (2 joueurs) ou abandonnée, pour ne jamais lister une room qui ne peut plus être rejointe.

## 6. Écran de partie synchronisé

- Plateau à deux moitiés (soi-même + adversaire), reflétant la structure du vrai playsheet officiel — pertinent maintenant que le multijoueur réintroduit un vrai adversaire.
- Vue adverse : main visible uniquement en nombre de cartes (dos de carte), Vie visible en nombre de cartes restantes (face cachée), zones Personnage/Lieu/Coût visibles en détail (information publique dans le vrai jeu).
- Indicateurs de phase et de tour partagés en temps réel entre les deux clients.
- Notifications d'action adverse (ex: "L'adversaire déclare une attaque avec [carte]") pour garder les deux joueurs synchronisés sans avoir à rafraîchir.
- **Drag and drop contextuel depuis la main pendant la phase Principale** : le joueur actif peut faire glisser une carte **Personnage** depuis sa main vers un emplacement valide de sa zone Personnage pour exprimer l'intention de jeu, au lieu de passer uniquement par un clic/bouton.
  - Le glisser-déposer n'est autorisé que pendant **sa propre phase Principale**, uniquement pour une carte de type **Personnage**, et uniquement si l'action est structurellement légale côté serveur (coût payable, place disponible ou remplacement du 6e Personnage explicitement géré par l'UI).
  - Le drop sur une zone invalide (phase incorrecte, mauvaise zone, carte non jouable, zone adverse, coût insuffisant) ne doit jamais déplacer la carte localement de façon optimiste : l'interface annule visuellement le geste et laisse l'état serveur inchangé.
  - La zone Personnage du joueur actif doit signaler visuellement qu'elle accepte le drop pendant le drag, sans empiéter sur les autres zones du plateau ni casser la lisibilité mobile.
  - Le drag and drop reste une **surcouche ergonomique** de l'action structurelle "jouer une carte depuis la main" : les validations de règles et le déplacement réel de la carte restent entièrement autoritaires côté serveur.

## 7. Animations et transitions fonctionnelles

Le plateau temps réel doit guider l'attention du joueur quand l'état change, sans jamais ralentir le déroulement d'une partie ni introduire d'ambiguïté sur l'état structurel envoyé par le serveur.

### 7.1 Déplacement d'une carte entre deux zones

- Quand une carte change de zone (main vers jeu, jeu vers défausse, deck vers main, DON!! deck vers zone de Coût, etc.), le client doit montrer un déplacement visuel entre l'origine et la destination plutôt qu'une disparition/réapparition instantanée.
- L'animation doit rester courte (ordre de grandeur : 150 à 300 ms) et rester lisible si plusieurs mouvements surviennent presque en même temps.
- Cette animation doit être désactivée ou fortement réduite si l'utilisateur exprime une préférence système de réduction des animations.

### 7.2 Sélection, ciblage et refus d'action

- Une carte choisie comme attaquant, cible ou Bloqueur doit afficher un état visuel continu et immédiatement identifiable.
- Une fois un attaquant choisi, les cibles valides doivent rester mises en évidence en continu ; les cibles invalides ne doivent pas attendre un clic pour révéler leur indisponibilité.
- Un clic sur une cible invalide doit produire un signal visuel bref de refus, sans ouvrir de dialogue ni dépendre d'un message textuel répétitif.

### 7.3 Révélation d'une carte cachée

- Quand une carte de Vie est retirée suite à un dégât et révélée au joueur concerné, le passage dos-visible vers face-visible doit être progressif et marquer l'événement.
- Si la préférence système demande moins d'animations, la révélation peut devenir instantanée à condition de rester clairement signalée.

### 7.4 Indicateur de phase

- Le changement de phase doit être porté par un indicateur de progression visuel, pas seulement par un remplacement abrupt de texte.
- Cet indicateur doit rester lisible même quand les phases s'enchaînent rapidement.
- Retour validé après essai UI : l'indicateur de phase reste sur l'affichage original par badges textuels dans le header ; le `Stepper` horizontal Nuxt UI a été abandonné car moins lisible dans cette mise en page.

### 7.5 Mise à jour de puissance affichée

- Quand la puissance affichée d'une carte change (notamment via attachement/retrait de DON!! ou Contre déclaré), la valeur visible doit converger progressivement vers la nouvelle valeur au lieu de basculer instantanément.
- Cette interpolation doit rester courte et ne jamais masquer durablement la valeur finale.

### 7.6 Déconnexion temporaire

- Quand un joueur est temporairement déconnecté pendant la fenêtre de reconnexion, l'adversaire doit voir un indicateur persistant d'attente, et non une notification ponctuelle.
- Cet indicateur doit s'arrêter immédiatement dès que la connexion revient ou que la partie se termine.

### 7.7 Stack UI retenue pour ces besoins

- Déplacement inter-zones et révélation de carte cachée : `motion-v`.
- Interpolation numérique de la puissance : VueUse (`useTransition`).
- Sélection/ciblage/refus et indicateur de déconnexion : CSS/Tailwind pur.
- Indicateur de phase : badges textuels horizontaux dans le header, avec mise en évidence de la phase active.
- Détection de préférence de réduction d'animations : VueUse (`usePreferredReducedMotion`).
- `@vueuse/motion` reste hors périmètre, redondant avec `motion-v`.

## 8. Statistiques joueur

Objectif : donner à chaque utilisateur un aperçu de ses performances passées, sans réintroduire un classement/MMR (toujours hors périmètre v1, voir ci-dessous) ni un historique détaillé de partie (pas de spectateur/replay).

- **Déclenchement de l'enregistrement** : un résultat de partie n'est persisté que sur une fin de partie propre au sens du moteur structurel (§3) — Vie à zéro ou deck-out, `DuelState.phase === 'finished'` avec un vainqueur déterminé. Un abandon par déconnexion après le délai de reconnexion (§3, 2 minutes) ne génère **aucun** enregistrement de statistique — uniquement la défaite structurelle immédiate déjà prévue pour la room en cours, sans trace persistée au-delà.
- **`DuelState` doit exposer explicitement le vainqueur** : aujourd'hui la room passe en `phase: 'finished'` avec uniquement un message de log ; il manque un champ structuré (`winnerSessionId`, motif de fin `life`/`deckOut`) exploitable par le serveur pour savoir qui a gagné sans reparser un log. C'est un prérequis technique à cette fonctionnalité, pas seulement une extension.
- **Un résultat de partie enregistré** conserve : les deux comptes (vainqueur/perdant), les decks utilisés par chaque joueur (référence nullable — un deck supprimé ensuite ne doit pas faire disparaître le résultat), le **Leader utilisé par chaque joueur au moment de la partie** (conservé indépendamment du deck, pour rester exploitable même si le deck est modifié ou supprimé par la suite), qui jouait en premier, le motif de fin (`life`/`deckOut`) et la durée de la partie.
- **Statistiques exposées à l'utilisateur connecté** (calculées à la lecture, pas de compteurs dénormalisés à maintenir) : total de parties, victoires/défaites, taux de victoire, série en cours ; le même détail décliné par deck sauvegardé et par Leader utilisé ; durée moyenne de partie ; taux de victoire en jouant en premier vs en second.
- Ce qui reste explicitement hors périmètre malgré cette fonctionnalité : tout classement/MMR, tout historique de partie détaillé (log complet, replay), toute agrégation au-delà du compte de l'utilisateur courant (pas de classement global, pas de comparaison entre joueurs).

## Hors périmètre v1 (pivot multijoueur)

- Résolution automatique du texte des effets de cartes, quel que soit le set — reste déclaratif indéfiniment dans cette version (pas de moteur de scripting prévu).
- Classement/MMR, saisons compétitives.
- Spectateur de partie, replay.
- Chat en partie (à évaluer séparément — nécessite modération).
- Mode tournoi, bracket.
- Achats/monétisation de tout ordre.

## Priorisation de livraison

0. 🎯 **Spike technique (1-2 jours)** : valider l'intégration Better Auth dans NestJS (module communautaire) et l'attachement de Colyseus au serveur HTTP Nest, avant de construire dessus — ce sont les deux seules briques de la stack sans intégration officielle Nest, donc les points de risque technique à défricher en premier.
1. Authentification OAuth + modèle de compte/deck en base.
2. Deck builder lié au compte avec catalogue de cartes intégré (repris et adapté du travail existant).
3. Infrastructure Colyseus : room de partie, état synchronisé, autorité serveur.
4. Couche structurelle complète (§3) : phases, DON!!, zones, ciblage réel, combat structurel avec Blocage/Contre déclaratifs, fin de partie.
5. Matchmaking (file d'attente + code de room) et lobby.
6. Animations et transitions fonctionnelles du plateau (§7), en respectant `prefers-reduced-motion`.
7. Statistiques joueur (§8) : champs de fin de partie sur `DuelState`, persistance des résultats de match, agrégation et exposition à l'utilisateur connecté.

## Critères d'acceptation

- Un utilisateur peut se connecter via OAuth et retrouver ses decks sauvegardés d'une session à l'autre.
- Un utilisateur peut construire un deck valide (50 cartes, plafond de 4, couleur cohérente avec le Leader) et le sauvegarder sur son compte.
- Un utilisateur peut générer un deck complet aléatoire depuis le deck builder ; le résultat respecte les contraintes de construction et reste modifiable avant sauvegarde.
- Deux utilisateurs peuvent se retrouver en partie via matchmaking aléatoire ou via un code de room partagé.
- Un utilisateur peut héberger une lobby publique avec une description libre ; cette lobby est visible avec sa description par les autres utilisateurs dans un bloc dédié de l'écran `/lobby`, rafraîchissable manuellement, et un autre utilisateur peut la rejoindre depuis cette liste.
- Une partie se déroule en temps réel avec information cachée réellement respectée côté serveur (main et Vie adverses non exposées côté client).
- Pendant sa phase Principale, le joueur actif peut jouer un Personnage depuis sa main en le glissant-déposant dans sa zone Personnage ; hors de ce contexte, le geste est refusé visuellement et aucun état local n'entre en contradiction avec le serveur.
- Le combat est résolu avec ciblage réel validé côté serveur ; Blocage et Contre restent déclaratifs (le joueur les applique lui-même, sans vérification du texte de la carte par le serveur).
- Toutes les cartes du catalogue restent jouables avec leurs stats de base (coût, puissance, contre) ; leur texte d'effet est affiché mais jamais appliqué automatiquement, quel que soit le set.
- La partie se termine correctement sur Vie à zéro ou deck-out, avec gestion propre d'une déconnexion temporaire d'un joueur.
- Les changements de zone importants, les révélations de cartes cachées, la progression de phase, les sélections/ciblages, la mise à jour de puissance et l'attente de reconnexion sont signalés par des transitions courtes, fonctionnelles et compatibles `prefers-reduced-motion`.

## Recommandation produit

Ce choix simplifie considérablement le projet par rapport à un arbitre complet, sans sacrifier l'essentiel de l'expérience multijoueur : deux joueurs peuvent se retrouver en ligne, construire leurs decks, et jouer une partie en temps réel avec une vraie gestion de l'information cachée — ce qui est déjà, en soi, un projet substantiel bien au-delà du solo initial. Le risque technique principal se limite désormais aux briques bien connues et outillées (Colyseus pour le temps réel, OAuth pour l'auth, PostgreSQL pour la persistance), sans le risque ouvert du scripting exhaustif d'effets de cartes. Le compromis assumé : les joueurs restent responsables d'appliquer correctement les effets de texte de leurs cartes, comme autour d'une vraie table — un modèle de confiance mutuelle qui a fait ses preuves dans des simulateurs équivalents pour d'autres jeux de cartes (Cockatrice pour Magic, par exemple), et qui reste cohérent avec l'esprit "assisté, pas automatisé" présent depuis la toute première version de ce MVP.
