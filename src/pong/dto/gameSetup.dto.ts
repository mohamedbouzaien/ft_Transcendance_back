import { IsBoolean, IsEnum, IsNotEmpty, IsNumberString, ValidateIf } from "class-validator";
import { GameBallSpeed, GameMaxPoints, GamePlayerHeight } from "../objects/game.object";

class GameSetupInterface {
  @IsNumberString()
  @IsNotEmpty()
  id: string;

  @ValidateIf(x => x.maxPoints)
  @IsEnum(GameMaxPoints)
  maxPoints: GameMaxPoints;

  @ValidateIf(x => x.ballSpeed)
  @IsEnum(GameBallSpeed)
  ballSpeed: GameBallSpeed;

  @ValidateIf(x => x.playerHeight)
  @IsEnum(GamePlayerHeight)
  playerHeight: GamePlayerHeight;

  @ValidateIf(x => x.isPlayerReady)
  @IsBoolean()
  isPlayerReady: boolean;
}

export default GameSetupInterface;