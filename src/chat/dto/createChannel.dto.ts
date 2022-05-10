import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";
import { ChannelStatus } from "../entities/channel.entity";

class CreateChannelDto {

  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  name: string;

  @IsNotEmpty()
  status: ChannelStatus;

  @ValidateIf(o => o.status === ChannelStatus.PROTECTED)
  @MinLength(7)
  password: string;
}

export default CreateChannelDto;