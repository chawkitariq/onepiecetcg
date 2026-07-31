import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DuelEventBusService } from './duel-event-bus.service';
import { DuelDomainEventsService } from './duel-domain-events.service';
import { DuelEventJournalService } from './duel-event-journal.service';
import { DuelEventOutbox } from './duel-event-outbox.entity';
import { DuelEventProjectorService } from './duel-event-projector.service';
import { DuelEventRecorderService } from './duel-event-recorder.service';
import { DuelEventRelayService } from './duel-event-relay.service';
import { DuelEventStream } from './duel-event-stream.entity';
import { DuelEventStreamService } from './duel-event-stream.service';
import { DuelEventsController } from './duel-events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DuelEventStream, DuelEventOutbox])],
  controllers: [DuelEventsController],
  providers: [
    DuelEventBusService,
    DuelEventStreamService,
    DuelEventRecorderService,
    DuelEventJournalService,
    DuelEventRelayService,
    DuelEventProjectorService,
    DuelDomainEventsService,
  ],
  exports: [DuelDomainEventsService, DuelEventRelayService],
})
export class DuelEventsModule {}
