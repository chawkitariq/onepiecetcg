import { Controller, Get, Param, Query } from '@nestjs/common';
import type { CardColor, CardSearchQuery, CardType } from '@onepiecetcg/shared';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('cards')
  searchCards(@Query() query: Record<string, string | undefined>) {
    return this.catalogService.searchCards(this.toSearchQuery(query));
  }

  @Get('cards/:id')
  getCard(@Param('id') id: string) {
    return this.catalogService.getCard(id);
  }

  @Get('filters')
  getFilters() {
    return this.catalogService.getFilters();
  }

  private toSearchQuery(query: Record<string, string | undefined>): CardSearchQuery {
    return {
      q: query.q,
      set: query.set,
      type: query.type as CardType | undefined,
      color: query.color as CardColor | undefined,
      cost: query.cost ? Number(query.cost) : undefined,
    };
  }
}
