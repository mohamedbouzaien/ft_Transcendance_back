import { Column, Entity, JoinTable, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
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
}

export default Acheivement;