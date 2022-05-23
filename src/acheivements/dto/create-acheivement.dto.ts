import { IsEnum } from "class-validator";
import { AcheivementCategory } from "../acheivement-category.enum";
import { AcheivementType } from "../acheivement-type.enum";

export class CreateAcheivementDto {
    id: number;
    @IsEnum(AcheivementType)
    type: AcheivementType;

    @IsEnum(AcheivementCategory)
    category: AcheivementCategory;

    message: string;
}