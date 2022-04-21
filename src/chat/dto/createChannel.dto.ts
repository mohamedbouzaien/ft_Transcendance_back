import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";
import { ChannelStatus } from "../entities/channel.entity";

class CreateChannelDto {

  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(12)
  name: string;

  @IsNotEmpty()
  status: ChannelStatus;

  @ValidateIf(o => Boolean(o.password))
  @MinLength(7)
  @IsString()
  password: string;
}

export default CreateChannelDto;