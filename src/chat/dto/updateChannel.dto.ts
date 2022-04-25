import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";

class UpdateChannelDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ValidateIf(o => Boolean(o.name))
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(12)
  name: string;

  @ValidateIf(o => ('password' in o || 'new_password' in o ) && o.password !== null )
  @MinLength(7)
  @IsString()
  password: string;

  @ValidateIf(o => ('password' in o || 'new_password' in o) && o.new_password !== null)
  @MinLength(7)
  @IsString()
  new_password: string
}

export default UpdateChannelDto;