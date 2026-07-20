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

État : réalisé et audité. Better Auth est monté côté NestJS avec OAuth Google/Discord uniquement, une persistance PostgreSQL pour Better Auth, un profil joueur TypeORM synchronisé depuis la session, des endpoints `/me` et `/private/auth-check` protégés, et une interface Nuxt de connexion/déconnexion consommant les cookies de session.

### Backend

- Intégrer Better Auth dans NestJS.
- Activer uniquement OAuth Google et Discord.
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

## Étape 3 — Catalogue de cartes

Objectif : rendre les cartes disponibles au deck builder et aux parties.

État : réalisé et audité. Le catalogue expose des types partagés dans `packages/shared`, un module NestJS `/catalog` qui consomme l'API OPTCG officielle (`https://optcgapi.com/api`) avec normalisation et cache local, des endpoints de recherche/filtres/fiche carte, une tolérance aux familles source partiellement indisponibles, et une page Nuxt `/catalogue` avec filtres MVP et fiche complète.

### Backend

- Créer le module catalogue.
- Consommer l'API OPTCG et normaliser les cartes vers le schéma partagé.
- Ajouter un cache local pour limiter les appels externes.
- Exposer les endpoints de recherche, filtre et fiche carte.
- Prévoir les erreurs d'indisponibilité de l'API source.

### Frontend

- Créer l'écran catalogue.
- Ajouter les filtres MVP : recherche, set, type, couleur, coût.
- Afficher une fiche carte complète : image, texte, coût, puissance, contre, type et édition.

### Validation

- Le catalogue est consultable depuis l'interface.
- Les filtres retournent des cartes cohérentes.
- La normalisation fournit tous les champs nécessaires au deck builder et au moteur structurel.

## Étape 4 — Deck builder et persistance des decks

Objectif : permettre à un utilisateur connecté de créer, valider, sauvegarder et partager ses decks.

État : réalisé et audité. Les contrats partagés couvrent les decks, la validation et l'import/export texte ; le backend expose un module NestJS `/decks` protégé par session avec entité TypeORM, CRUD propriétaire et validation serveur ; le frontend fournit une page Nuxt `/decks` pour construire, importer/exporter, valider, sauvegarder, modifier et supprimer les decks.

### Backend

- Créer les entités TypeORM pour les decks sauvegardés.
- Implémenter la validation serveur : exactement 1 Leader, 50 cartes hors Leader, maximum 4 exemplaires par numéro, couleurs compatibles avec le Leader.
- Implémenter l'import texte et l'export texte.
- Exposer les endpoints CRUD des decks de l'utilisateur connecté.
- Refuser toute sauvegarde invalide avec des erreurs exploitables côté frontend.

### Frontend

- Créer le deck builder avec sélection du Leader.
- Ajouter et retirer des cartes depuis le catalogue.
- Afficher le compteur de cartes, les exemplaires et les erreurs de validation.
- Ajouter les actions importer, exporter, sauvegarder, modifier et supprimer.

### Validation

- Un utilisateur crée un deck valide et le retrouve après reconnexion.
- Un deck invalide est bloqué côté client et côté serveur.
- L'import/export texte conserve le contenu du deck.

## Étape 5 — Fondations Colyseus et état de partie

Objectif : créer une room de partie faisant autorité, sans encore couvrir tout le gameplay.

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

## Étape 9 — Matchmaking et lobby

Objectif : permettre aux joueurs de démarrer des parties via file publique ou code privé.

### Backend

- Créer une file d'attente aléatoire par ordre d'arrivée.
- Créer et rejoindre une room par code partageable.
- Associer chaque entrée de lobby à un deck sauvegardé valide.
- Nettoyer les entrées de queue et rooms abandonnées.

### Frontend

- Créer le lobby de sélection de deck.
- Ajouter les actions rejoindre la file, quitter la file, créer une room privée, rejoindre par code.
- Afficher les états d'attente et d'erreur.

### Validation

- Deux joueurs sont appariés via la file aléatoire.
- Deux joueurs rejoignent une partie via un code.
- Un joueur sans deck valide ne peut pas entrer en partie.

## Étape 10 — Finition MVP

Objectif : rendre l'expérience complète, robuste et testable.

### Backend

- Ajouter les tests unitaires des validateurs de deck.
- Ajouter les tests unitaires du moteur structurel : phases, DON!!, zones, ciblage, combat, dégâts, deck-out.
- Ajouter les tests e2e des endpoints auth/decks/lobby.
- Vérifier les logs et erreurs serveur.
- Documenter les variables d'environnement nécessaires.

### Frontend

- Vérifier les parcours : connexion, catalogue, deck builder, lobby, partie.
- Ajouter les états de chargement, vide et erreur.
- Vérifier le responsive du plateau et des écrans de gestion.
- S'assurer que l'interface n'affiche aucune option hors périmètre v1.

### Validation

- Les commandes de build, lint et typecheck passent pour les packages concernés.
- Une partie complète peut être jouée de bout en bout entre deux utilisateurs.
- Les critères d'acceptation de `docs/spec.md` sont tous couverts.

## Hors périmètre à ne pas implémenter en v1

- Résolution automatique des textes d'effets.
- Moteur de scripting par carte.
- Classement, MMR ou saisons compétitives.
- Spectateur, replay ou historique détaillé.
- Chat en partie.
- Mode tournoi ou bracket.
- Achats, boutique ou monétisation.
