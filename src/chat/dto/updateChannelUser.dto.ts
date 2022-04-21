import { IsDate, IsDateString, IsNotEmpty, IsNumber, IsOptional, ValidateIf } from "class-validator";
import { ChannelUserRole, SanctionType } from "../entities/channelUser.entity";

class UpdateChannelUserDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsOptional()
  role: ChannelUserRole;

  @IsOptional()
  sanction: SanctionType;

  @ValidateIf(o => Boolean(o.end_of_sanction))
  @IsDateString()
  end_of_sanction: Date;
}

export default UpdateChannelUserDto;
