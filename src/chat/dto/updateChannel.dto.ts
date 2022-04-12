import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import User from "src/users/user.entity";

class UpdateChannelDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsOptional()
  admins_id: number[];

  @IsOptional()
  invited_members: User[];
}

export default UpdateChannelDto;