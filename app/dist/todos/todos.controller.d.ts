import { CreateTodoDto } from './dto/create-todo.dto';
import { TodosService } from './todos.service';
export declare class TodosController {
    private readonly todosService;
    constructor(todosService: TodosService);
    findAll(): Promise<import("./todo.entity").default[]>;
    findOne(id: string): Promise<import("./todo.entity").default>;
    createTodo(newTodo: CreateTodoDto): void;
    updateTodo(id: string, todo: CreateTodoDto): Promise<import("./todo.entity").default>;
    deleteTodo(id: string): Promise<void>;
}
