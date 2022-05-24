import { IsNotEmpty, IsNumber, ValidateIf } from "class-validator";
import CreateMessageDto from "./createMessage.dto";

class CreateDirectMessageDto extends CreateMessageDto {
  
  @ValidateIf(o => Boolean(!o.channelId))
  @IsNumber()
  @IsNotEmpty()
  recipientId: number;

  @ValidateIf(o => Boolean(o.channelId))
  @IsNumber()
  @IsNotEmpty()
  channelId: number;
}

export default CreateDirectMessageDto