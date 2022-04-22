import { IsNumber, isNumberString, IsNumberString, IsOptional, isString } from 'class-validator';

export class FindOneParams {
  @IsNumberString()
  id: number;

  @IsOptional()
  password: string;
}