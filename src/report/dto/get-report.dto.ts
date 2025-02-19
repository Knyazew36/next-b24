import { Type } from 'class-transformer';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';

export class FilterDto {
  @IsOptional()
  @IsEnum(['front', 'back'])
  departament?: 'front' | 'back';
}

export class GetReportDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => FilterDto)
  filter?: FilterDto;
}
