import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogCardParamDto, CatalogSearchQueryDto } from './catalog.dto';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('cards')
  searchCards(@Query() query: CatalogSearchQueryDto) {
    return this.catalogService.searchCards(query);
  }

  @Get('cards/:id')
  getCard(@Param() params: CatalogCardParamDto) {
    return this.catalogService.getCard(params.id);
  }

  @Get('filters')
  getFilters() {
    return this.catalogService.getFilters();
  }
}
