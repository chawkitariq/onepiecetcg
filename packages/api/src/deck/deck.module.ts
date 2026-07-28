import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerAccountModule } from '../player-account/player-account.module';
import { CatalogModule } from '../catalog/catalog.module';
import { DeckController } from './deck.controller';
import { DeckService } from './deck.service';
import { SavedDeck } from './saved-deck.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SavedDeck]),
    PlayerAccountModule,
    CatalogModule,
  ],
  controllers: [DeckController],
  providers: [DeckService],
  exports: [DeckService],
})
export class DeckModule {}
