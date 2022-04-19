import User from "src/users/user.entity"
import CreateMessageDto from "./createMessage.dto";

class CreateDirectMessageDto extends CreateMessageDto {
  recipient: User;
}

export default CreateDirectMessageDto