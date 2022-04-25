"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodosModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const todos_controller_1 = require("./todos.controller");
const todo_entity_1 = require("./todo.entity");
const todos_service_1 = require("./todos.service");
let TodosModule = class TodosModule {
};
TodosModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([todo_entity_1.default])],
        controllers: [todos_controller_1.TodosController],
        providers: [todos_service_1.TodosService]
    })
], TodosModule);
exports.TodosModule = TodosModule;
//# sourceMappingURL=todos.module.js.map