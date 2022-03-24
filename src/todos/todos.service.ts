import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Todo from './todo.entity';
@Injectable()
export class TodosService {

    constructor(
        @InjectRepository(Todo)
        private todosRepository: Repository<Todo>
    ) {}

    getAll() {
        return this.todosRepository.find();
    }

    async getById(id: number) {
        const todo = await this.todosRepository.findOne(id);
        if (todo) {
            return todo;
        }
        throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);
    }

    async create(todo: CreateTodoDto) {
        const newTodo = await this.todosRepository.create(todo);
        await this.todosRepository.save(newTodo);
        return newTodo;
    }

    async update(id:number, todo: CreateTodoDto) {
        await this.todosRepository.update(id, todo);
        const updatedTodo = await this.todosRepository.findOne(id);
        if (updatedTodo) {
            return updatedTodo;
        }
        throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);

    }

    async delete(id: number) {
        const deleteTodo = await this.todosRepository.delete(id);
        if (!deleteTodo.affected) {
            throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);
        }
    }
}
