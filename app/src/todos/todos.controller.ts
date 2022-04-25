import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import JwtTwoFactornGuard from 'src/authentication/jwt-two-factor.guard';
import { CreateTodoDto } from './dto/create-todo.dto';
import { TodosService } from './todos.service';

@Controller('todos')
export class TodosController {
    constructor (private readonly todosService: TodosService) {}
    @Get()
    @UseGuards(JwtTwoFactornGuard)
    findAll() {
        return this.todosService.getAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.todosService.getById(+id);
    }

    @Post()
    @UseGuards(JwtAuthenticationGuard)
    createTodo(@Body() newTodo: CreateTodoDto){
        this.todosService.create(newTodo);
    }

    @Patch(':id')
    updateTodo(@Param('id') id: string, @Body() todo: CreateTodoDto) {
        return this.todosService.update(+id, todo);
    }

    @Delete(':id')
    deleteTodo(@Param('id') id: string) {
        return this.todosService.delete(+id);
    }
}
