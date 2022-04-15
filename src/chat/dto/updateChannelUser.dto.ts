import { IsNotEmpty, IsOptional } from "class-validator";
import { ChannelUserRole, SanctionType } from "../entities/channelUser.entity";

class UpdateChannelUserDto {
  @IsNotEmpty()
  id: number;

  @IsOptional()
  role: ChannelUserRole;

  @IsOptional()
  sanction: SanctionType;

  @IsOptional()
  end_of_sanction: Date;
}

export default UpdateChannelUserDto;
