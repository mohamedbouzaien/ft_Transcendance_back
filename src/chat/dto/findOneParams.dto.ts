import { IsNumber, IsNumberString, IsOptional } from 'class-validator';

export class FindOneParams {
  @IsNumber()
  id: number;

  @IsOptional()
  password: string;
}