# Spécification — Système d’événements métier fiable avec Event Outbox

**Statut :** Draft
**Version :** 1.1
**Projet :** One Piece TCG Web App
**Périmètre :** `DuelRoom`, moteur de duel, moteur d’effets, Event Outbox, Event Relay, exposition aux services internes et tiers

---

# 1. Contexte

L’application utilise actuellement :

* NestJS pour le serveur applicatif ;
* Colyseus pour les rooms et la synchronisation temps réel ;
* une `DuelRoom` comme orchestrateur principal d’un match ;
* un moteur de duel TypeScript ;
* un moteur d’effets TypeScript ;
* un state partagé basé sur les schémas Colyseus ;
* des événements internes utilisés pour la résolution des effets ;
* un état actif du duel principalement conservé en mémoire.

La `DuelRoom` reçoit les commandes des joueurs, appelle les moteurs, modifie l’état du duel et synchronise les clients.

Le projet souhaite introduire un système d’événements métier fiable pouvant être consommé par :

* des services de statistiques ;
* des trackers tiers ;
* des overlays ;
* des systèmes d’achievements ;
* des services anti-triche ;
* des outils d’analyse ;
* des services de replay visuel ;
* des intégrations futures.

Le système central doit produire et publier des faits métier fiables.

Il ne doit pas être responsable de l’exploitation complète de ces événements.

---

# 2. Décisions de périmètre

La version 1 du système ne gère pas :

* la persistance complète du duel ;
* les snapshots de duel ;
* la restauration d’une `DuelRoom` ;
* la reprise d’une partie après crash ;
* la reconstruction des timers ;
* la reconstruction des effets en attente ;
* l’Event Sourcing ;
* un modèle métier complètement séparé de Colyseus.

L’état actif reste en mémoire dans la `DuelRoom`.

Les moteurs continuent temporairement à travailler avec une copie isolée de `DuelStateSchema`.

Le système garantit uniquement :

> Les événements métier enregistrés dans l’outbox sont durables et seront publiés de manière asynchrone, même si le bus ou les consommateurs sont temporairement indisponibles.

---

# 3. Stratégie d’état retenue

## 3.1 Décision v1

En version 1, les moteurs utilisent le state partagé actuel du projet, c’est-à-dire le type Colyseus de duel existant.

Dans cette spécification, ce type est noté :

```ts
DuelState
```

L’interface du moteur doit donc être explicite :

```ts
export interface DuelEngine {
  execute(
    state: DuelState,
    command: DuelCommand,
    context: DuelExecutionContext,
  ): DuelEngineResult;
}
```

```ts
export interface DuelEngineResult {
  state: DuelState;
  events: DomainEventDraft[];
}
```

Ce type reste couplé à Colyseus et ne doit pas être considéré comme un véritable `DuelDomainState`.

## 3.2 Caractère transitoire

Cette décision vise à :

* limiter le refactor initial ;
* réduire les risques sur le gameplay ;
* introduire l’outbox indépendamment d’un chantier de découplage complet ;
* conserver les moteurs existants avec un minimum de changements.

La cible future reste :

```text
DuelDomainState
→ projection
→ DuelState
```

Cette cible est hors périmètre de la version 1.

## 3.3 Contraintes malgré le couplage temporaire

Même si `DuelState` est utilisé, les règles suivantes sont obligatoires :

* le moteur travaille sur une copie isolée ;
* l’état vivant de la Room n’est jamais muté avant le commit de l’outbox ;
* les commandes utilisent un `playerId` métier stable ;
* les événements utilisent un `playerId` métier stable ;
* aucun `sessionId` ne doit apparaître dans un événement ;
* aucun `Client` Colyseus, aucune `Room`, aucun `StateView`, aucune API de transport ou callback runtime ne doit être transmis au moteur ;
* le moteur ne doit manipuler que des données métier et des structures d’état sérialisables ;
* le moteur ne doit jamais appeler directement une API Colyseus ;
* aucun socket, callback ou objet runtime ne doit apparaître dans les événements ;
* le système d’événements ne doit dépendre ni de Colyseus ni de NestJS dans ses contrats.

---

# 4. Objectifs

Le système doit permettre de :

1. produire des événements métier depuis les moteurs ;
2. conserver l’ordre des événements à l’intérieur d’un match ;
3. persister les événements avant leur diffusion ;
4. publier les événements de manière asynchrone ;
5. survivre à une indisponibilité temporaire du bus ;
6. permettre plusieurs consommateurs indépendants ;
7. permettre le streaming temps réel ;
8. permettre le rattrapage après déconnexion ;
9. protéger les informations cachées ;
10. versionner les contrats ;
11. permettre l’intégration de services tiers ;
12. limiter le couplage entre gameplay et infrastructure ;
13. garantir qu’un état n’est visible qu’après l’enregistrement de ses événements.

---

# 5. Non-objectifs

Le système ne garantit pas :

* la restauration d’un duel après crash ;
* la survie de l’état en mémoire ;
* la reprise d’une Room ;
* la reconstruction exacte du duel depuis les événements ;
* une livraison exactly-once ;
* la persistance de toutes les mutations internes ;
* la persistance des événements UI ;
* la continuité du match après perte du processus ;
* la production automatique d’un événement terminal après chaque crash ;
* la séparation complète entre le domaine et Colyseus en version 1.

Le système ne garantit pas la production automatique d’un événement terminal après chaque crash du processus.

Par conséquent :

* un flux d’événements peut contenir des événements d’un match interrompu brutalement ;
* l’absence de `MatchEnded` ne signifie pas nécessairement qu’aucun événement ultérieur n’existera ;
* les consommateurs doivent tolérer les matchs incomplets ou interrompus.

---

# 6. Garantie principale

La garantie cible est :

```text
at-least-once delivery
```

Une fois qu’un événement est enregistré dans l’outbox :

* il est durable ;
* il ne dépend plus de la disponibilité du bus ;
* le relay peut le republier ;
* il sera publié tôt ou tard, sauf erreur permanente explicitement signalée.

Un événement peut être reçu plusieurs fois.

Les consommateurs doivent être idempotents.

---

# 7. Architecture générale

```text
Client joueur
      │
      │ message Colyseus
      ▼
DuelRoom
      │
      ├── résout sessionId -> playerId
      ├── valide le contexte de Room
      ├── sérialise les commandes
      └── crée la commande métier
      │
      ▼
Copie isolée de DuelState
      │
      ▼
Duel Engine
      │
      ├── applique les règles
      ├── appelle le moteur d’effets
      ├── produit le nouvel état
      └── produit DomainEventDraft[]
      │
      ▼
DuelEventRecorder
      │
      ├── réserve les séquences
      ├── enrichit les événements
      ├── valide leur structure
      └── écrit dans l’outbox
      │
      ▼
Commit DB
      │
      ├── DuelRoom adopte le nouvel état
      ├── Colyseus synchronise les clients
      └── la commande est confirmée
      │
      ▼
Event Relay
      │
      ▼
Bus ou journal canonique
      │
      ├── services internes
      └── Event Gateway
                 │
                 ├── trackers tiers
                 ├── overlays
                 ├── spectateurs
                 └── partenaires
```

---

# 8. Responsabilités de la DuelRoom

La `DuelRoom` reste l’orchestrateur principal du match.

Elle est responsable de :

* recevoir les messages Colyseus ;
* identifier le joueur connecté ;
* mapper `sessionId` vers `playerId` ;
* transformer un message en commande métier ;
* garantir l’exécution séquentielle des commandes ;
* créer une copie isolée de l’état ;
* appeler les moteurs ;
* collecter les événements produits ;
* appeler le `DuelEventRecorder` ;
* adopter le nouvel état uniquement après le commit ;
* appliquer le nouvel état au state Colyseus ;
* confirmer ou rejeter la commande.

Elle ne doit pas :

* publier directement sur le bus ;
* gérer les retries ;
* calculer les statistiques ;
* exposer directement les événements canoniques aux tiers ;
* contenir la logique SQL de l’outbox ;
* attribuer directement les séquences ;
* effectuer un rollback manuel de l’état vivant.

---

# 9. Identité stable des joueurs

Le système distingue :

```text
playerId
=
identité métier stable du participant dans le match

sessionId
=
identité temporaire d’une connexion Colyseus

userId
=
identité éventuelle du compte utilisateur
```

Les moteurs, commandes et événements utilisent exclusivement :

```ts
type PlayerId = string;
```

Ils ne doivent jamais utiliser :

```text
sessionId
socketId
clientId
connectionId
```

La Room maintient un mapping runtime :

```ts
private readonly playerIdBySessionId =
  new Map<string, PlayerId>();
```

Exemple :

```ts
const playerId =
  this.playerIdBySessionId.get(client.sessionId);

if (!playerId) {
  throw new UnauthorizedDuelCommandError();
}

const command: PlayCardCommand = {
  type: "PlayCard",
  playerId,
  cardInstanceId: message.cardInstanceId,
};
```

Une reconnexion peut produire un nouveau `sessionId`, mais conserve le même `playerId`.

---

# 10. Copie isolée de l’état

Le moteur ne doit jamais travailler directement sur l’état vivant de la Room.

Flux obligatoire :

```text
état vivant
    │
    ▼
copie isolée
    │
    ▼
exécution moteur
    │
    ├── newState
    └── events
           │
           ▼
     commit outbox
       ┌───┴───┐
       │       │
    succès   échec
       │       │
       ▼       ▼
   adopter   abandonner
   newState  la copie
```

Exemple :

```ts
const workingState = cloneDuelState(
  this.state,
);

const result = this.duelEngine.execute(
  workingState,
  command,
  context,
);

const recorded =
  await this.duelEventRecorder.record({
    matchId: this.matchId,
    actorPlayerId: playerId,
    commandId,
    actionId,
    eventDrafts: result.events,
    engineVersion,
    rulesetVersion,
  });

// Seulement après le commit de l’outbox.
this.lastSequenceNumber =
  recorded.lastSequenceNumber;

// Le nouvel état de travail devient alors le nouvel état vivant.
this.applyCommittedState(result.state);
```

En cas d’échec :

* la copie est abandonnée ;
* l’état vivant reste inchangé ;
* aucun patch Colyseus n’est envoyé ;
* la commande n’est pas confirmée ;
* aucun rollback manuel n’est exécuté.

En cas d’échec, la Room ne restaure rien : elle n’a simplement jamais adopté le nouvel état.

---

# 11. Responsabilités du Duel Engine

Le moteur de duel est responsable de :

* valider les règles ;
* appliquer les commandes ;
* modifier la copie de travail ;
* produire les événements métier ;
* conserver leur ordre logique ;
* appeler le moteur d’effets.

Il ne connaît pas :

* NestJS ;
* les repositories ;
* l’outbox ;
* le bus ;
* les trackers ;
* les permissions ;
* les UUID techniques ;
* les numéros de séquence ;
* les connexions réseau.

Interface v1 :

```ts
export interface DuelEngine {
  execute(
    state: DuelState,
    command: DuelCommand,
    context: DuelExecutionContext,
  ): DuelEngineResult;
}
```

---

# 12. Responsabilités du moteur d’effets

Le moteur d’effets est responsable de :

* résoudre les effets ;
* modifier la copie de travail ;
* produire les événements métier liés aux effets ;
* demander les choix nécessaires ;
* rester déterministe pour les mêmes entrées.

Interface conceptuelle :

```ts
export interface EffectEngineResult {
  state: DuelState;
  events: DomainEventDraft[];
  pendingChoice?: PendingChoice;
}
```

Le moteur d’effets ne publie rien directement.

Ses événements sont agrégés avec ceux du moteur de duel.

---

# 13. Événements internes et événements métier

Le système distingue deux familles.

## 13.1 Signaux internes

Les signaux internes servent au fonctionnement du moteur d’effets.

Exemples :

```text
BeforeAttackResolution
AfterCardPlayed
OnDamageReceived
EffectStackUpdated
```

Ils peuvent être très liés à l’implémentation.

Ils ne sont pas automatiquement persistés.

## 13.2 Événements métier

Les événements métier représentent des faits observables.

Exemples :

```text
CardPlayed
AttackDeclared
DamageDealt
CharacterKOD
EffectResolved
```

Seuls les événements métier destinés aux consommateurs sont enregistrés dans l’outbox.

Un signal interne peut conduire à la création d’un événement métier, mais les deux concepts restent distincts.

---

# 14. Domain Event Draft

Les moteurs produisent des événements sans métadonnées techniques.

```ts
export interface DomainEventDraft<
  TType extends string = string,
  TPayload = unknown,
> {
  type: TType;
  version: number;
  payload: TPayload;
}
```

Exemple :

```ts
const event: DomainEventDraft<
  "CardPlayed",
  CardPlayedPayload
> = {
  type: "CardPlayed",
  version: 1,
  payload: {
    playerId: "player-1",
    cardInstanceId: "card-42",
    cardDefinitionId: "OP01-001",
    fromZone: "HAND",
    toZone: "CHARACTER_AREA",
    paidCost: 5,
  },
};
```

---

# 15. Canonical Domain Event

Le `DuelEventRecorder` transforme les drafts en événements canoniques.

```ts
export interface CanonicalDomainEvent<
  TType extends string = string,
  TPayload = unknown,
> {
  eventId: string;
  eventType: TType;
  eventVersion: number;

  matchId: string;
  sequenceNumber: number;

  occurredAt: string;
  recordedAt: string;

  actorPlayerId?: PlayerId;

  correlationId: string;
  causationId: string;
  transactionId: string;

  engineVersion: string;
  rulesetVersion: string;

  payload: TPayload;
}
```

Exemple :

```json
{
  "eventId": "evt_01...",
  "eventType": "CardPlayed",
  "eventVersion": 1,
  "matchId": "match_01...",
  "sequenceNumber": 106,
  "occurredAt": "2026-07-30T09:00:00.120Z",
  "recordedAt": "2026-07-30T09:00:00.145Z",
  "actorPlayerId": "player-1",
  "correlationId": "match_01...",
  "causationId": "command_01...",
  "transactionId": "action_01...",
  "engineVersion": "3.2.0",
  "rulesetVersion": "2026.07",
  "payload": {
    "playerId": "player-1",
    "cardInstanceId": "card-42",
    "cardDefinitionId": "OP01-001",
    "fromZone": "HAND",
    "toZone": "CHARACTER_AREA",
    "paidCost": 5
  }
}
```

---

# 15.1 Confidentialité des événements

Les événements canoniques internes peuvent contenir des informations cachées du duel.

Ils ne doivent pas être exposés directement à tous les consommateurs.

Exemple :

* un joueur propriétaire peut voir l’identité exacte d’une carte piochée ;
* un spectateur ou un tracker tiers ne doit voir que le fait qu’une carte a été piochée ;
* un service interne autorisé peut recevoir la version canonique complète.

Le système doit donc distinguer :

* l’événement canonique persistant ;
* la projection exposée à un type précis de consommateur.

Le filtrage dépend du contexte d’accès et ne doit pas être implémenté dans le moteur.

---

# 16. Duel Event Recorder

Le `DuelEventRecorder` reçoit un résultat métier déjà validé.

Il est responsable de :

* vérifier la structure technique des événements ;
* vérifier que le type et la version existent ;
* attribuer les `eventId` ;
* attribuer les séquences ;
* ajouter les métadonnées ;
* écrire les événements dans l’outbox ;
* mettre à jour le compteur du stream ;
* retourner les événements canoniques.

Il ne doit pas :

* vérifier les règles métier ;
* vérifier les coûts ;
* vérifier les cibles ;
* recalculer un combat ;
* interpréter un effet ;
* modifier l’état produit par le moteur ;
* créer des événements métier qui auraient dû être produits par le moteur.

Interface :

```ts
export interface DuelEventRecorder {
  record(
    input: RecordValidatedDuelEventsInput,
  ): Promise<RecordedDuelEvents>;
}
```

```ts
export interface RecordValidatedDuelEventsInput {
  matchId: string;
  actorPlayerId?: PlayerId;

  commandId: string;
  actionId: string;

  eventDrafts: DomainEventDraft[];

  engineVersion: string;
  rulesetVersion: string;
}
```

```ts
export interface RecordedDuelEvents {
  events: CanonicalDomainEvent[];
  lastSequenceNumber: number;
}
```

---

# 17. Création du stream événementiel

Chaque match possède un stream événementiel.

Table :

```text
duel_event_streams
------------------
match_id
last_sequence_number
status
created_at
updated_at
```

Statuts :

```text
OPEN
COMPLETED
ABORTED
```

Le stream doit être créé explicitement au début du match.

## 17.1 Création atomique recommandée

La création du stream et l’événement `MatchCreated` sont enregistrés dans la même transaction.

```text
BEGIN

INSERT duel_event_streams
  match_id = match-42
  last_sequence_number = 1
  status = OPEN

INSERT event_outbox
  sequence_number = 1
  event_type = MatchCreated

COMMIT
```

Ainsi :

```text
MatchCreated = sequence 1
```

## 17.2 Responsabilité

Un composant dédié crée le stream.

Nom proposé :

```text
DuelEventStreamService
```

Interface :

```ts
export interface DuelEventStreamService {
  createStream(
    input: CreateDuelEventStreamInput,
  ): Promise<CanonicalDomainEvent>;
}
```

```ts
export interface CreateDuelEventStreamInput {
  matchId: string;
  actorPlayerId?: PlayerId;
  engineVersion: string;
  rulesetVersion: string;
  matchCreatedPayload: MatchCreatedPayload;
}
```

## 17.3 Stream manquant

Le recorder ne doit pas créer silencieusement un stream.

Si un événement normal est enregistré sans stream existant :

```ts
throw new DuelEventStreamNotFoundError(matchId);
```

Un match ne doit pas commencer par :

```text
1 CardPlayed
```

---

# 18. Attribution des séquences

Les événements sont ordonnés par match.

Exemple :

```text
104 CostPaid
105 CardMoved
106 CardPlayed
```

L’attribution des séquences et l’insertion des événements sont faites dans la même transaction.

```text
BEGIN

SELECT duel_event_streams
WHERE match_id = :matchId
FOR UPDATE

nextSequence =
  last_sequence_number + 1

UPDATE duel_event_streams
SET last_sequence_number = :newLastSequence

INSERT événements dans event_outbox

COMMIT
```

Contraintes :

```text
UNIQUE(event_id)
UNIQUE(match_id, sequence_number)
```

Aucun ordre global entre plusieurs matchs n’est requis.

---

# 19. Transaction d’enregistrement

La transaction contient :

```text
verrouillage du stream
+
attribution des séquences
+
mise à jour de last_sequence_number
+
insertion des événements dans l’outbox
```

Exemple :

```text
BEGIN

SELECT stream FOR UPDATE

UPDATE duel_event_streams
SET last_sequence_number = 106

INSERT event 104
INSERT event 105
INSERT event 106

COMMIT
```

En cas d’échec :

* le compteur n’est pas modifié ;
* aucun événement n’est conservé ;
* la copie de travail est abandonnée ;
* la Room n’adopte pas le nouvel état ;
* la commande échoue.

---

# 20. Flux complet d’une commande

```text
1. La DuelRoom reçoit la commande.

2. Elle résout sessionId -> playerId.

3. Elle vérifie le contexte du joueur.

4. Elle bloque les autres commandes du match.

5. Elle clone le DuelStateSchema vivant.

6. Le DuelEngine exécute la commande.

7. Le moteur d’effets résout les effets.

8. Les moteurs retournent :
   - le nouvel état de travail ;
   - DomainEventDraft[].

9. Le DuelEventRecorder :
   - verrouille le stream ;
   - attribue les séquences ;
   - enrichit les événements ;
   - écrit l’outbox ;
   - met à jour lastSequenceNumber.

10. La transaction commit.

11. La DuelRoom adopte le nouvel état.

12. Colyseus synchronise les clients.

13. La commande est confirmée.

14. Le Event Relay publie les événements.
```

---

# 21. Frontière d’une action

Une action correspond à une commande résolue jusqu’au prochain besoin d’entrée externe.

Exemple sans choix :

```text
PlayCard
→ CostPaid
→ CardMoved
→ CardPlayed
→ EffectActivated
→ EffectResolved
```

Tous les événements partagent :

```text
transactionId
```

Exemple avec choix :

```text
PlayCard
→ CardPlayed
→ EffectActivated
→ ChoiceRequested
→ commit
```

Puis :

```text
ChoiceSubmitted
→ EffectTargetSelected
→ EffectResolved
→ commit
```

---

# 22. Catalogue initial d’événements

## Cycle du match

* `MatchCreated`
* `PlayerJoined`
* `DeckLocked`
* `StartingPlayerDetermined`
* `OpeningHandDrawn`
* `MulliganRequested`
* `MulliganResolved`
* `MatchStarted`
* `MatchEnded`
* `PlayerConceded`
* `MatchAborted`

## Cycle du tour

* `TurnStarted`
* `PhaseChanged`
* `TurnEnded`

## Cartes et zones

* `CardDrawn`
* `CardPlayed`
* `CardMoved`
* `CardRevealed`
* `CardDiscarded`
* `CardReturnedToHand`
* `CardPlacedOnDeck`
* `CardPlacedUnderCard`
* `CardAddedToLife`
* `LifeCardTaken`
* `DeckShuffled`

## DON

* `DonAdded`
* `DonAttached`
* `DonDetached`
* `DonRested`
* `DonRefreshed`
* `CostPaid`

## Combat

* `AttackDeclared`
* `AttackTargetSelected`
* `BlockerDeclared`
* `CounterUsed`
* `BattleResolved`
* `DamageDealt`
* `CharacterKOD`
* `AttackCancelled`

## Effets

* `EffectTriggered`
* `EffectActivated`
* `EffectTargetSelected`
* `EffectResolved`
* `EffectCancelled`
* `EffectFailed`
* `ChoiceRequested`
* `ChoiceSubmitted`

---

# 23. Granularité des événements

Un événement représente un fait métier atomique.

Exemples valides :

```text
CostPaid
CardMoved
CardPlayed
EffectActivated
```

Exemples interdits :

```text
ArrayChanged
PropertyUpdated
StateMutated
ResolverCalled
StackPopped
```

Les événements ne doivent pas refléter les détails internes d’implémentation.

---

# 24. Confidentialité

Les événements canoniques peuvent contenir des données cachées.

Exemple canonique :

```json
{
  "eventType": "CardDrawn",
  "payload": {
    "playerId": "player-1",
    "count": 1,
    "cardInstanceId": "card-42",
    "cardDefinitionId": "OP05-067"
  }
}
```

Vue publique :

```json
{
  "eventType": "CardDrawn",
  "payload": {
    "playerId": "player-1",
    "count": 1
  }
}
```

Vue du propriétaire :

```json
{
  "eventType": "CardDrawn",
  "payload": {
    "playerId": "player-1",
    "count": 1,
    "cardInstanceId": "card-42",
    "cardDefinitionId": "OP05-067"
  }
}
```

Le flux canonique complet ne doit pas être exposé directement aux tiers.

---

# 25. Projection des événements

Le Gateway applique une projection selon le consommateur.

```ts
export interface EventProjector<
  TCanonical extends CanonicalDomainEvent,
  TExposed,
> {
  project(
    event: TCanonical,
    context: EventViewerContext,
  ): TExposed | null;
}
```

```ts
export interface EventViewerContext {
  viewerType:
    | "PLAYER"
    | "SPECTATOR"
    | "THIRD_PARTY"
    | "INTERNAL";

  playerId?: PlayerId;
  scopes: string[];
  matchEnded: boolean;
}
```

L’événement projeté conserve autant que possible :

* `eventId` ;
* `eventType` ;
* `eventVersion` ;
* `matchId` ;
* `sequenceNumber` ;
* `occurredAt`.

Le payload peut être filtré.

---

# 26. Structure de l’outbox

```text
event_outbox
------------
event_id
match_id
sequence_number
event_type
event_version
payload
metadata
status
created_at
published_at
attempt_count
next_attempt_at
last_error
```

Statuts :

```text
PENDING
PROCESSING
PUBLISHED
FAILED
```

Contraintes :

```text
UNIQUE(event_id)
UNIQUE(match_id, sequence_number)
```

L’outbox garantit la publication.

Elle ne constitue pas nécessairement un historique permanent.

---

# 27. Event Relay

Le relay :

1. sélectionne un lot d’événements `PENDING` ;
2. réserve ces événements ;
3. les publie sur le bus ;
4. les marque `PUBLISHED` en cas de succès ;
5. programme un retry en cas d’échec ;
6. les marque `FAILED` après trop de tentatives.

Le relay doit supporter plusieurs workers.

Une stratégie de verrouillage doit empêcher deux workers de traiter simultanément le même événement.

---

# 28. Livraison au moins une fois

Un événement peut être publié plusieurs fois.

Exemple :

```text
1. Le relay publie evt-106.
2. Le bus accepte evt-106.
3. Le relay plante avant la confirmation.
4. evt-106 reste PENDING.
5. Le relay republie evt-106.
```

Les consommateurs doivent dédupliquer grâce à :

```text
eventId
```

ou :

```text
matchId + sequenceNumber
```

---

# 29. Journal de reprise

L’outbox n’est pas nécessairement exposée directement.

Un journal de lecture doit permettre :

```text
getEvents(
  matchId,
  afterSequenceNumber,
  limit
)
```

Ce journal peut être :

* Redis Streams ;
* une table dédiée ;
* un topic avec rétention ;
* un event store temporaire ;
* une projection alimentée par le relay.

Le journal est distinct de la responsabilité de l’outbox.

---

# 30. Event Gateway

Le Gateway expose conceptuellement :

```text
getEvents(matchId, afterSequenceNumber, limit)
subscribe(matchId, afterSequenceNumber?)
```

Il est responsable de :

* l’authentification ;
* l’autorisation ;
* la projection de visibilité ;
* les quotas ;
* la reprise ;
* la backpressure ;
* l’isolation des tiers.

La version 1 ne garantit pas un snapshot public persistant.

Un consommateur doit :

* suivre le flux depuis le début ;
* récupérer les événements disponibles ;
* ou accepter une timeline partielle.

---

# 31. Fermeture normale d’un stream

Lors d’une fin normale, la transaction finale doit :

* attribuer la dernière séquence ;
* insérer l’événement terminal ;
* fermer le stream.

Exemple :

```text
BEGIN

SELECT stream FOR UPDATE

UPDATE duel_event_streams
SET
  last_sequence_number = :finalSequence,
  status = COMPLETED

INSERT MatchEnded dans event_outbox

COMMIT
```

Les événements de gameplay doivent être refusés après fermeture.

---

# 32. Crash de Room et MatchAborted

La version 1 ne garantit pas automatiquement la création d’un événement `MatchAborted` après un crash.

Un processus brutalement arrêté ne peut pas produire lui-même cet événement.

Deux options sont possibles.

## Option minimale retenue

Le système accepte que certains streams restent temporairement `OPEN`.

Une procédure de nettoyage ou un futur composant de liveness pourra les clôturer.

La spec ne promet pas actuellement :

* la détection immédiate des Rooms perdues ;
* la production automatique de `MatchAborted` ;
* la clôture temps réel des streams interrompus.

## Extension future

Un `DuelLivenessMonitor` pourra utiliser des leases de Room pour :

* détecter une Room disparue ;
* vérifier que le stream est toujours `OPEN` ;
* attendre une période de grâce ;
* clôturer le stream ;
* insérer `MatchAborted` via la même outbox.

Cette extension est hors périmètre de la version 1.

---

# 33. Replay

La restauration d’une Room et le replay sont deux fonctionnalités différentes.

Un replay peut consommer les événements ordonnés :

```text
MatchStarted
TurnStarted
CardDrawn
CardPlayed
AttackDeclared
BattleResolved
MatchEnded
```

Il peut produire :

* une timeline textuelle ;
* un historique des actions ;
* un overlay ;
* une représentation visuelle partielle ;
* des statistiques de séquence.

Sans état initial persistant ni événements suffisamment complets, le système ne garantit pas la reconstruction exacte du plateau à chaque instant.

---

# 34. Stockage recommandé

Le compteur de séquence et l’outbox doivent être stockés dans la même base transactionnelle.

```text
Base transactionnelle
├── duel_event_streams
└── event_outbox
```

Redis peut être utilisé ensuite comme :

* bus ;
* journal chaud ;
* cache ;
* support de streaming ;
* backend du Gateway.

Redis ne doit pas remplacer la transaction principale d’attribution des séquences et d’écriture de l’outbox.

---

# 35. Gestion des erreurs

## Commande métier invalide

* aucun nouvel état adopté ;
* aucun événement de réussite ;
* aucune écriture dans l’outbox.

## Erreur moteur

* la copie de travail est abandonnée ;
* l’état vivant reste inchangé ;
* aucune écriture.

## Erreur d’outbox

* rollback de la transaction ;
* aucun événement enregistré ;
* aucune séquence consommée ;
* la copie est abandonnée ;
* la commande échoue.

## Bus indisponible

* les événements restent dans l’outbox ;
* le relay réessaie ;
* les nouvelles commandes peuvent continuer si la DB reste disponible.

## Gateway indisponible

* le duel continue ;
* les événements restent disponibles selon la rétention du journal ;
* les consommateurs reprennent plus tard.

## Crash de Room

* le duel actif peut être perdu ;
* aucune restauration n’est garantie ;
* les événements déjà commités restent disponibles ;
* les événements non commités n’existent pas ;
* le stream peut rester `OPEN` jusqu’à nettoyage.

---

# 36. Observabilité

Métriques minimales :

* nombre de commandes reçues ;
* nombre de commandes validées ;
* nombre de commandes rejetées ;
* durée d’exécution du moteur ;
* durée de clonage du state ;
* nombre d’événements produits ;
* durée d’écriture de l’outbox ;
* taille de l’outbox ;
* âge du plus ancien événement pending ;
* nombre de retries ;
* nombre d’événements failed ;
* latence entre production et publication ;
* nombre de streams ouverts ;
* nombre de streams ouverts anormalement longtemps ;
* nombre de conflits de séquence.

Logs structurés :

```text
matchId
playerId
commandId
actionId
eventId
sequenceNumber
eventType
streamStatus
```

---

# 37. Tests

## Tests moteur

Vérifier :

* l’état produit ;
* les événements produits ;
* leur ordre ;
* leur payload ;
* l’absence d’événement lors d’une commande invalide.

## Tests d’isolation d’état

Vérifier que :

* l’état vivant n’est pas muté avant le commit ;
* un échec d’outbox laisse l’état vivant intact ;
* aucun rollback manuel n’est nécessaire.

## Tests du recorder

Vérifier :

* attribution des identifiants ;
* attribution des séquences ;
* validation technique ;
* stream manquant ;
* stream fermé ;
* concurrence sur un match ;
* rollback.

## Tests de création de stream

Vérifier que :

* le stream est créé explicitement ;
* `MatchCreated` reçoit la séquence 1 ;
* aucune séquence n’est dupliquée ;
* un stream existant ne peut pas être recréé.

## Tests d’outbox

Vérifier :

* insertion ;
* réservation ;
* retry ;
* duplication ;
* publication ;
* échec permanent.

## Tests de confidentialité

Vérifier :

* vue propriétaire ;
* vue adversaire ;
* vue spectateur ;
* vue tierce ;
* vue interne.

## Tests de reprise

```text
1. Le consommateur reçoit jusqu’à 42.
2. Il se déconnecte.
3. Les événements 43 à 51 sont publiés.
4. Il revient avec afterSequenceNumber=42.
5. Il reçoit 43 à 51.
6. Il reprend le flux live.
```

## Tests de crash

Vérifier que :

* les événements commités restent publiables ;
* les événements non commités n’existent pas ;
* aucun état vivant n’est adopté avant le commit ;
* aucune restauration n’est attendue ;
* un stream peut rester ouvert sans promesse de clôture automatique.

---

# 38. Organisation proposée du code

```text
packages/
├── shared/
│   ├── duel-state-schema.ts
│   │
│   └── event-contracts/
│       ├── domain-event-draft.ts
│       ├── canonical-domain-event.ts
│       ├── event-catalog.ts
│       ├── event-viewer-context.ts
│       └── events/
│
├── api/
│   └── src/
│       ├── duel/
│       │   ├── duel.room.ts
│       │   ├── commands/
│       │   ├── engines/
│       │   ├── effects/
│       │   ├── cloning/
│       │   │   └── clone-duel-state-schema.ts
│       │   └── identity/
│       │       └── player-session-registry.ts
│       │
│       └── events/
│           ├── streams/
│           │   ├── duel-event-stream.service.ts
│           │   └── duel-event-stream.repository.ts
│           │
│           ├── recording/
│           │   ├── duel-event-recorder.service.ts
│           │   └── event-enricher.service.ts
│           │
│           ├── outbox/
│           │   ├── event-outbox.repository.ts
│           │   └── event-relay.service.ts
│           │
│           ├── projection/
│           │   ├── event-projector.ts
│           │   └── projectors/
│           │
│           ├── journal/
│           └── gateway/
```

---

# 39. Évolution future vers DuelDomainState

La migration future pourra introduire :

```ts
export interface DuelDomainState {
  // TypeScript pur, sans dépendance Colyseus
}
```

Architecture cible :

```text
DuelDomainState
      │
      ├── Duel Engine
      ├── Effect Engine
      └── Event production
      │
      ▼
DuelStateProjector
      │
      ▼
DuelStateSchema
```

Cette évolution permettra :

* un découplage complet ;
* un clonage plus simple ;
* des tests plus purs ;
* une éventuelle persistance future ;
* une meilleure séparation entre domaine et réseau.

Elle ne doit pas bloquer la mise en œuvre de l’outbox en version 1.

---

# 40. Critères d’acceptation

Le système est conforme lorsque :

1. la `DuelRoom` reste l’orchestrateur principal ;
2. le moteur utilise explicitement `DuelStateSchema` en v1 ;
3. le caractère transitoire de ce choix est documenté ;
4. les moteurs produisent des `DomainEventDraft[]` ;
5. les moteurs travaillent sur une copie isolée ;
6. l’état vivant n’est jamais muté avant le commit ;
7. aucune restauration manuelle de l’état n’est utilisée ;
8. les commandes utilisent un `playerId` stable ;
9. les événements ne contiennent aucun `sessionId` ;
10. le stream est créé explicitement ;
11. `MatchCreated` possède la séquence 1 ;
12. l’attribution des séquences et l’outbox sont atomiques ;
13. les événements sont ordonnés par match ;
14. les événements commités ne sont pas perdus ;
15. le bus peut être indisponible sans perte d’événements ;
16. les doublons peuvent être détectés ;
17. les informations cachées sont filtrées ;
18. Colyseus n’est pas utilisé comme journal durable ;
19. aucun snapshot n’est requis ;
20. aucune restauration de Room n’est garantie ;
21. aucune clôture automatique après crash n’est promise en v1 ;
22. les statistiques restent la responsabilité des consommateurs ;
23. le replay reste un consommateur indépendant du flux.

---

# 41. Résumé

Dans la version 1 :

```text
DuelRoom
=
orchestrateur runtime
```

```text
DuelStateSchema
=
état utilisé temporairement par les moteurs
```

```text
Copie isolée
=
protection contre les mutations avant commit
```

```text
Duel Engine / Effect Engine
=
producteurs des faits métier
```

```text
DuelEventStreamService
=
création et cycle de vie du stream
```

```text
DuelEventRecorder
=
enrichissement, séquences et persistance
```

```text
Event Outbox
=
garantie de publication durable
```

```text
Event Relay
=
publication asynchrone et retries
```

```text
Event Gateway
=
exposition sécurisée aux tiers
```

La règle centrale est :

> Une commande n’est finalisée que lorsque tous ses événements métier ont été enregistrés dans l’outbox. Le nouvel état de la Room n’est adopté qu’après ce commit.

L’outbox garantit :

```text
que les faits enregistrés seront publiés
```

Elle ne garantit pas :

```text
que le duel pourra être restauré après un crash
```

Le découplage complet vers `DuelDomainState` constitue une évolution future distincte.
