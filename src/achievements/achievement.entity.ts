import AchievementHistory from "src/achievements-history/achievements-history.entity";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { AchievementCategory } from "./achievement-category.enum";
import { AchievementType } from "./achievement-type.enum";

@Entity()
class Achievement {
    @PrimaryColumn()
    public id: number;

    @Column({
        type: "enum",
        enum: AchievementType,
    })
    public  type: AchievementType;

    @Column({
        type: "enum",
        enum: AchievementCategory
    })
    public category: AchievementCategory;

    @Column()
    public  message: string;

    @OneToMany(() => AchievementHistory, (achievement_history: AchievementHistory) => achievement_history.achievement)
    public  achievement_histories: AchievementHistory[];
}

export default Achievement;