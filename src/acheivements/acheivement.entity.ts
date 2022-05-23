import AcheivementHistory from "src/acheivements-history/acheivements-history.entity";
import { Column, Entity, JoinTable, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { AcheivementCategory } from "./acheivement-category.enum";
import { AcheivementType } from "./acheivement-type.enum";

@Entity()
class Acheivement {
    @PrimaryColumn()
    public id: number;

    @Column({
        type: "enum",
        enum: AcheivementType,
    })
    public  type: AcheivementType;

    @Column({
        type: "enum",
        enum: AcheivementCategory
    })
    public category: AcheivementCategory;

    @Column()
    public  message: string;

    @OneToMany(() => AcheivementHistory, (acheivement_history: AcheivementHistory) => acheivement_history.acheivement)
    public  acheivement_histories: AcheivementHistory[];
}

export default Acheivement;