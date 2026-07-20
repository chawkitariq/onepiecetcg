import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { CardSearchQuery } from '@onepiecetcg/shared';

const CARD_TYPES = ['Leader', 'Character', 'Event', 'Stage', 'DON!!'] as const;
const CARD_COLORS = [
  'Red',
  'Green',
  'Blue',
  'Purple',
  'Black',
  'Yellow',
] as const;

export class CatalogSearchQueryDto implements CardSearchQuery {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  set?: string;

  @IsOptional()
  @IsIn(CARD_TYPES)
  type?: CardSearchQuery['type'];

  @IsOptional()
  @IsIn(CARD_COLORS)
  color?: CardSearchQuery['color'];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(20)
  cost?: number;
}

export class CatalogCardParamDto {
  @IsString()
  @MaxLength(32)
  @Matches(/^[A-Za-z0-9-]+$/)
  id!: string;
}
