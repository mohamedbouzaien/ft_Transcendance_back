import { string } from "@hapi/joi";
import { IsNotEmpty, IsNumberString } from "class-validator";

export class FindOne {
  @IsNumberString()
  @IsNotEmpty()
  id: string;
}