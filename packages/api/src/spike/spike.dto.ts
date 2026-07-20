import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SpikeTypeormQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  label?: string;
}
