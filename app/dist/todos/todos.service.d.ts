import { CreateTodoDto } from './dto/create-todo.dto';
import { Repository } from 'typeorm';
import Todo from './todo.entity';
export declare class TodosService {
    private todosRepository;
    constructor(todosRepository: Repository<Todo>);
    getAll(): Promise<Todo[]>;
    getById(id: number): Promise<Todo>;
    create(todo: CreateTodoDto): Promise<Todo>;
    update(id: number, todo: CreateTodoDto): Promise<Todo>;
    delete(id: number): Promise<void>;
}
