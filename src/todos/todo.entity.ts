import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
class Todo {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public title: string;

    @Column()
    public done: boolean;

    @Column()
    public description: string;
}
export default Todo;