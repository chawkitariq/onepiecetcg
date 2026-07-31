import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import type { DeckPayload } from '@onepiecetcg/shared';

export class DeckCardDto {
  @IsString()
  @MaxLength(32)
  cardId!: string;

  @IsInt()
  @Min(1)
  @Max(50)
  quantity!: number;
}

export class DeckPayloadDto implements DeckPayload {
  @IsString()
  @MaxLength(80)
  name!: string;

  @IsString()
  @MaxLength(32)
  leaderCardId!: string;

  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => DeckCardDto)
  cards!: DeckCardDto[];
}

export class DeckIdParamDto {
  @IsUUID()
  id!: string;
}
