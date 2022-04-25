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
exports.UserRelationshipsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_two_factor_guard_1 = require("../authentication/jwt-two-factor.guard");
const users_service_1 = require("../users/users.service");
const update_user_relationship_status_dto_1 = require("./dto/update-user-relationship-status.dto");
const user_relationship_status_enum_1 = require("./user-relationship-status.enum");
const user_relationships_service_1 = require("./user-relationships.service");
let UserRelationshipsController = class UserRelationshipsController {
    constructor(userRelationshipsService, usersService) {
        this.userRelationshipsService = userRelationshipsService;
        this.usersService = usersService;
    }
    async createRelationship(id, request) {
        const requestedUser = await this.usersService.getById(id);
        if (requestedUser) {
            const { user } = request;
            return this.userRelationshipsService.create({
                issuer: user,
                receiver: requestedUser,
                status: user_relationship_status_enum_1.UserRelationshipStatus.PENDING
            });
        }
        throw new common_1.HttpException('Requested user doesn\'t exist', common_1.HttpStatus.BAD_REQUEST);
    }
    async updateStatus(request, { id, status }) {
        const { user } = request;
        const userRelationship = await this.userRelationshipsService.getById(id);
        return await this.userRelationshipsService.updateStatus(status, userRelationship, user);
    }
    async deleteRelationship(id, request) {
        const { user } = request;
        return await this.userRelationshipsService.delete(id, user);
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_two_factor_guard_1.default),
    __param(0, (0, common_1.Body)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserRelationshipsController.prototype, "createRelationship", null);
__decorate([
    (0, common_1.Post)('update-status'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_two_factor_guard_1.default),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_relationship_status_dto_1.UpdateUserRelationshipStatusDto]),
    __metadata("design:returntype", Promise)
], UserRelationshipsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_two_factor_guard_1.default),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserRelationshipsController.prototype, "deleteRelationship", null);
UserRelationshipsController = __decorate([
    (0, common_1.Controller)('user-relationships'),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [user_relationships_service_1.UserRelationshipsService,
        users_service_1.UsersService])
], UserRelationshipsController);
exports.UserRelationshipsController = UserRelationshipsController;
//# sourceMappingURL=user-relationships.controller.js.map