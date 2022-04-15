import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import User from "src/users/user.entity";

class UpdateChannelDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsOptional()
  password: string;
}

export default UpdateChannelDto;