import User from "src/users/user.entity";

class PlayerInterface {
  user: User;
  isReady: boolean;
  timer?: Date;
  xWall?: number;
  x?: number;
  y?: number;
  score?: number;
}

export default PlayerInterface;