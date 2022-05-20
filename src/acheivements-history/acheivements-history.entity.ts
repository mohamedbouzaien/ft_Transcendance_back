import Acheivement from "src/acheivements/acheivement.entity";
import User from "src/users/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
class AcheivementHistory {

    @PrimaryGeneratedColumn()
    public id?: number;

    @ManyToOne(()=>User, (user: User) => user.acheivement_history)
    @JoinColumn({name: 'user_id'})
    public user: User;

    @Column()
    public user_id;

    @Column({default: false})
    public isRead: boolean;

    @OneToOne(() => Acheivement, {eager: true})
    @JoinTable()
    @JoinColumn({name: 'acheivement_id'})
    public acheivement: Acheivement;

    @Column()
    public acheivement_id: number;
}

export default AcheivementHistory;
