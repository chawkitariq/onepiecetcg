import type { DomainEventDraft } from './duel-domain-event.types';
import { UnsupportedDomainEventError } from './duel-event-errors';

const SUPPORTED_EVENT_VERSIONS = {
  MatchCreated: [1],
  PlayerJoined: [1],
  DeckLocked: [1],
  StartingPlayerDetermined: [1],
  OpeningHandDrawn: [1],
  MulliganResolved: [1],
  MatchStarted: [1],
  TurnStarted: [1],
  PhaseChanged: [1],
  TurnEnded: [1],
  CostPaid: [1],
  CardPlayed: [1],
  CardDiscarded: [1],
  DonAttached: [1],
  AttackDeclared: [1],
  AttackTargetSelected: [1],
  BlockerDeclared: [1],
  CounterUsed: [1],
  BattleResolved: [1],
  DamageDealt: [1],
  CharacterKOD: [1],
  LifeCardTaken: [1],
  ChoiceSubmitted: [1],
  PlayerConceded: [1],
  MatchEnded: [1],
} as const;

/**
 * Validates that an event draft belongs to the currently published catalog.
 */
export function assertSupportedDomainEvent(draft: DomainEventDraft): void {
  const supportedVersions =
    SUPPORTED_EVENT_VERSIONS[
      draft.type as keyof typeof SUPPORTED_EVENT_VERSIONS
    ];

  if (
    !supportedVersions?.some(
      (supportedVersion) => supportedVersion === draft.version,
    )
  ) {
    throw new UnsupportedDomainEventError(draft.type, draft.version);
  }
}
