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
exports.UserRelationshipsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_relationship_status_enum_1 = require("./user-relationship-status.enum");
const user_relationship_entity_1 = require("./user-relationship.entity");
let UserRelationshipsService = class UserRelationshipsService {
    constructor(userRelashionshipRepository) {
        this.userRelashionshipRepository = userRelashionshipRepository;
    }
    async create(userRelationshipDto) {
        const userRelationshipFound = await this.userRelashionshipRepository.findOne({
            issuer: userRelationshipDto.issuer,
            receiver: userRelationshipDto.receiver
        });
        if (!userRelationshipFound) {
            const userRelationshipReverseFound = await this.userRelashionshipRepository.findOne({
                issuer: userRelationshipDto.receiver,
                receiver: userRelationshipDto.issuer
            });
            if (!userRelationshipReverseFound) {
                const userRelationship = await this.userRelashionshipRepository.create(userRelationshipDto);
                await this.userRelashionshipRepository.save(userRelationship);
                return userRelationship;
            }
        }
        throw new common_1.HttpException('Relationship with this user already exists', common_1.HttpStatus.BAD_REQUEST);
    }
    async getById(id) {
        const userRelationship = await this.userRelashionshipRepository.findOne(id);
        if (userRelationship)
            return userRelationship;
        throw new common_1.HttpException('Relationship doesn\'t exist', common_1.HttpStatus.BAD_REQUEST);
    }
    async updateStatus(status, userRelationship, user) {
        if (userRelationship.receiver == user && userRelationship.status == user_relationship_status_enum_1.UserRelationshipStatus.PENDING
            && status == user_relationship_status_enum_1.UserRelationshipStatus.FRIENDS) {
            await this.userRelashionshipRepository.update(userRelationship.id, {
                status: user_relationship_status_enum_1.UserRelationshipStatus.FRIENDS
            });
            return this.userRelashionshipRepository.findOne(userRelationship.id);
        }
        if (status == user_relationship_status_enum_1.UserRelationshipStatus.BLOCKED && userRelationship.status == user_relationship_status_enum_1.UserRelationshipStatus.FRIENDS
            || userRelationship.status == user_relationship_status_enum_1.UserRelationshipStatus.PENDING) {
            await this.userRelashionshipRepository.update(userRelationship.id, {
                status: user_relationship_status_enum_1.UserRelationshipStatus.BLOCKED
            });
            return this.userRelashionshipRepository.findOne(userRelationship.id);
        }
        throw new common_1.HttpException('Relationship status not alloud', common_1.HttpStatus.BAD_REQUEST);
    }
    async delete(id, user) {
        const userRelationship = await this.userRelashionshipRepository.findOne(id);
        if (userRelationship && (userRelationship.issuer_id == user.id || userRelationship.receiver_id == user.id))
            return await this.userRelashionshipRepository.delete(id);
        throw new common_1.HttpException('Relationship status not alloud', common_1.HttpStatus.BAD_REQUEST);
    }
};
UserRelationshipsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_relationship_entity_1.default)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserRelationshipsService);
exports.UserRelationshipsService = UserRelationshipsService;
//# sourceMappingURL=user-relationships.service.js.map