import { IsNotEmpty, IsNumber, IsNumberString } from "class-validator";

class MouseMoveInterface {
  @IsNumberString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @IsNotEmpty()
  clientY: number;

  @IsNumber()
  @IsNotEmpty()
  canvasLocationY: number;
}

export default MouseMoveInterface;