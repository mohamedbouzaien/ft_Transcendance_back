import Achievement from "src/achievements/achievement.entity";
import User from "src/users/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
class AchievementHistory {

    @PrimaryGeneratedColumn()
    public id?: number;

    @ManyToOne(()=>User, (user: User) => user.achievement_history)
    @JoinColumn({name: 'user_id'})
    public user: User;

    @Column()
    public user_id;

    @Column({default: false})
    public isRead: boolean;

    @ManyToOne(() => Achievement, (achievement: Achievement) => achievement.achievement_histories)
    @JoinTable()
    public achievement: Achievement;
}

export default AchievementHistory;
