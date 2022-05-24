import { IsNotEmpty, IsNumber } from "class-validator";

class CreateMessageDto {

  @IsNumber()
  @IsNotEmpty()
  channelId: number;

  @IsNotEmpty()
  content: string;
}

export default CreateMessageDto;