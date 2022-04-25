"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRelationshipsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_relationship_entity_1 = require("./user-relationship.entity");
const user_relationships_service_1 = require("./user-relationships.service");
const user_relationships_controller_1 = require("./user-relationships.controller");
const users_module_1 = require("../users/users.module");
let UserRelationshipsModule = class UserRelationshipsModule {
};
UserRelationshipsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_relationship_entity_1.default]), users_module_1.UsersModule],
        providers: [user_relationships_service_1.UserRelationshipsService],
        controllers: [user_relationships_controller_1.UserRelationshipsController]
    })
], UserRelationshipsModule);
exports.UserRelationshipsModule = UserRelationshipsModule;
//# sourceMappingURL=user-relationships.module.js.map