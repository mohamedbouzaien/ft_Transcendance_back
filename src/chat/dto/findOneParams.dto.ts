import { IsNumberString, IsOptional } from 'class-validator';

export class FindOneParams {
  @IsNumberString()
  id: number;

  @IsOptional()
  password: string;
}