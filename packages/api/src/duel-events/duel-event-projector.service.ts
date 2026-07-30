import { Injectable } from '@nestjs/common';
import type { CanonicalDomainEvent } from './duel-domain-event.types';

export type EventViewerContext = {
  viewerType: 'PLAYER' | 'SPECTATOR' | 'THIRD_PARTY' | 'INTERNAL';
  playerId?: string;
  scopes: string[];
  matchEnded: boolean;
};

export type ExposedDomainEvent = Pick<
  CanonicalDomainEvent,
  | 'eventId'
  | 'eventType'
  | 'eventVersion'
  | 'matchId'
  | 'sequenceNumber'
  | 'occurredAt'
> & {
  payload: Record<string, unknown>;
};

/**
 * Projects canonical duel events into a consumer-safe view. The current event
 * catalog emitted by the room does not yet carry hidden-card identities, but
 * this projector is the mandatory boundary for future confidential payloads.
 */
@Injectable()
export class DuelEventProjectorService {
  /** Projects one canonical event for a specific viewer context. */
  public project(
    event: CanonicalDomainEvent,
    context: EventViewerContext,
  ): ExposedDomainEvent | null {
    if (context.viewerType === 'INTERNAL') {
      return {
        eventId: event.eventId,
        eventType: event.eventType,
        eventVersion: event.eventVersion,
        matchId: event.matchId,
        sequenceNumber: event.sequenceNumber,
        occurredAt: event.occurredAt,
        payload: event.payload,
      };
    }

    switch (event.eventType) {
      case 'MatchCreated':
      case 'PlayerJoined':
      case 'DeckLocked':
      case 'OpeningHandDrawn':
      case 'StartingPlayerDetermined':
      case 'MulliganResolved':
      case 'MatchStarted':
      case 'TurnStarted':
      case 'PhaseChanged':
      case 'TurnEnded':
      case 'CardPlayed':
      case 'CardDiscarded':
      case 'CostPaid':
      case 'DonAttached':
      case 'AttackDeclared':
      case 'AttackTargetSelected':
      case 'BlockerDeclared':
      case 'CounterUsed':
      case 'BattleResolved':
      case 'CharacterKOD':
      case 'DamageDealt':
      case 'ChoiceSubmitted':
      case 'PlayerConceded':
      case 'MatchEnded':
        return {
          eventId: event.eventId,
          eventType: event.eventType,
          eventVersion: event.eventVersion,
          matchId: event.matchId,
          sequenceNumber: event.sequenceNumber,
          occurredAt: event.occurredAt,
          payload: event.payload,
        };
      case 'LifeCardTaken':
        return {
          eventId: event.eventId,
          eventType: event.eventType,
          eventVersion: event.eventVersion,
          matchId: event.matchId,
          sequenceNumber: event.sequenceNumber,
          occurredAt: event.occurredAt,
          payload: {
            playerId: event.payload.playerId,
            count: event.payload.count,
            destinationZone: event.payload.destinationZone,
          },
        };
      default:
        return null;
    }
  }
}
