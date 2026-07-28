import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerAccountModule } from '../player-account/player-account.module';
import { CatalogModule } from '../catalog/catalog.module';
import { DecksController } from './decks.controller';
import { DecksService } from './decks.service';
import { SavedDeck } from './saved-deck.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SavedDeck]),
    PlayerAccountModule,
    CatalogModule,
  ],
  controllers: [DecksController],
  providers: [DecksService],
  exports: [DecksService],
})
export class DecksModule {}
