"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const todo_entity_1 = require("./todo.entity");
let TodosService = class TodosService {
    constructor(todosRepository) {
        this.todosRepository = todosRepository;
    }
    getAll() {
        return this.todosRepository.find();
    }
    async getById(id) {
        const todo = await this.todosRepository.findOne(id);
        if (todo) {
            return todo;
        }
        throw new common_1.HttpException('Todo not found', common_1.HttpStatus.NOT_FOUND);
    }
    async create(todo) {
        const newTodo = await this.todosRepository.create(todo);
        await this.todosRepository.save(newTodo);
        return newTodo;
    }
    async update(id, todo) {
        await this.todosRepository.update(id, todo);
        const updatedTodo = await this.todosRepository.findOne(id);
        if (updatedTodo) {
            return updatedTodo;
        }
        throw new common_1.HttpException('Todo not found', common_1.HttpStatus.NOT_FOUND);
    }
    async delete(id) {
        const deleteTodo = await this.todosRepository.delete(id);
        if (!deleteTodo.affected) {
            throw new common_1.HttpException('Todo not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
};
TodosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(todo_entity_1.default)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TodosService);
exports.TodosService = TodosService;
//# sourceMappingURL=todos.service.js.map