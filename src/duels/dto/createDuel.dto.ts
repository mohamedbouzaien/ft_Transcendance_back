import User from "src/users/user.entity";

class CreateDuelDto {
  sender: User;
  receiver: User;
}

export default CreateDuelDto;