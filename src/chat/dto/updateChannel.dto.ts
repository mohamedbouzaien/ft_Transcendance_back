import { IsDate, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";
import { ChannelStatus } from "../entities/channel.entity";

class UpdateChannelDto {
  @IsNumberString()
  @IsNotEmpty()
  id: number;

  @ValidateIf(o => Boolean(o.name))
  @MinLength(3)
  @MaxLength(12)
  name?: string;

  @ValidateIf(o => Boolean(o.status))
  @IsOptional()
  status?: ChannelStatus;

  @IsOptional()
  @IsDate()
  last_message_at?: Date;

  @ValidateIf(o => (o.password && o.password != ''))
  @MinLength(7)
  password?: string;

  @ValidateIf(o => (o.status === ChannelStatus.PROTECTED || (o.password && o.password != '')))
  @MinLength(7)
  new_password?: string
}

export default UpdateChannelDto;