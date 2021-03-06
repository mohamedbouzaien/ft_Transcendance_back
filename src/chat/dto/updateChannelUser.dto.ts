import { IsDateString, IsEnum, IsNotEmpty, IsNumber, ValidateIf } from "class-validator";
import { ChannelUserRole, SanctionType } from "../entities/channelUser.entity";

class UpdateChannelUserDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ValidateIf(o => Boolean(o.role))
  @IsEnum(ChannelUserRole)
  role: ChannelUserRole;

  @ValidateIf(o => Boolean(o.sanction))
  @IsEnum(SanctionType)
  sanction: SanctionType;

  @ValidateIf(o => Boolean(o.end_of_sanction))
  @IsDateString()
  end_of_sanction: Date;
}

export default UpdateChannelUserDto;
