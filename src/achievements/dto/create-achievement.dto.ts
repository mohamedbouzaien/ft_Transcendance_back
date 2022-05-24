import { IsEnum } from "class-validator";
import { AchievementCategory } from "../achievement-category.enum";
import { AchievementType } from "../achievement-type.enum";

export class CreateAchievementDto {
    id: number;
    @IsEnum(AchievementType)
    type: AchievementType;

    @IsEnum(AchievementCategory)
    category: AchievementCategory;

    message: string;
}