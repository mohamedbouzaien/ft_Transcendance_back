import { IsNotEmpty } from "class-validator";

class UpdateChannelPasswordDto {
  @IsNotEmpty()
  id: number;

  old_password: string;
  
  new_password: string;
}

export default UpdateChannelPasswordDto;