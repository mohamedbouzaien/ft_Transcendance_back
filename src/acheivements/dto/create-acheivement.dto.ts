import { IsEnum } from "class-validator";
import { AcheivementType } from "../acheivement-type.enum";

export class CreateAcheivementDto {
    id: number;
    @IsEnum(AcheivementType)
    type: AcheivementType;
    
    message: string;
}