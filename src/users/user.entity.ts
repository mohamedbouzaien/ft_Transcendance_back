import { Exclude } from "class-transformer";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
class User {
    @PrimaryGeneratedColumn()
    public id?: number;
    @Column({unique: true})
    public email: string;
    @Column()
    public name: string;
    @Column()
    public password: string;
    @Column({ nullable: true})
    @Exclude()
    public currentHashedRefreshToken?: string;
    @Column({nullable: true, unique: true})
    public intraId: string;
}

export default User;