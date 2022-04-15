import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

class UpdateChannelDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsOptional()
  password: string;
}

export default UpdateChannelDto;