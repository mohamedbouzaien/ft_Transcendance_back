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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
const bcrypt = require("bcrypt");
const local_files_service_1 = require("../local-files/local-files.service");
let UsersService = class UsersService {
    constructor(usersRepository, localFilesService) {
        this.usersRepository = usersRepository;
        this.localFilesService = localFilesService;
    }
    async create(userData) {
        const newUser = await this.usersRepository.create(userData);
        await this.usersRepository.save(newUser);
        return newUser;
    }
    async setCurrentRefreshToken(refreshToken, userId) {
        const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.usersRepository.update(userId, {
            currentHashedRefreshToken
        });
    }
    async getByEmail(email) {
        const user = await this.usersRepository.findOne({ email });
        if (user)
            return user;
        throw new common_1.HttpException('User with this email does not exist', common_1.HttpStatus.NOT_FOUND);
    }
    async getByUsername(username) {
        const user = await this.usersRepository.findOne({ username });
        if (user)
            return user;
        throw new common_1.HttpException('User with this username does not exist', common_1.HttpStatus.NOT_FOUND);
    }
    async getById(id) {
        const user = await this.usersRepository.findOne({
            id
        }, {
            relations: [
                'sent_relationships',
                'received_relationships'
            ]
        });
        if (user) {
            return user;
        }
        throw new common_1.HttpException('User with this id does not exist', common_1.HttpStatus.NOT_FOUND);
    }
    async getByIntraId(intra_id) {
        const user = await this.usersRepository.findOne({ intra_id });
        if (user)
            return user;
        return undefined;
    }
    async getUserIfRefreshTokenMatches(refreshToken, userId) {
        const user = await this.getById(userId);
        const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.currentHashedRefreshToken);
        if (isRefreshTokenMatching) {
            return user;
        }
    }
    async removeRefreshToken(userId) {
        return this.usersRepository.update(userId, {
            currentHashedRefreshToken: null
        });
    }
    async setTwoFactorAuthenticationSecret(secret, userId) {
        return this.usersRepository.update(userId, {
            twoFactorAuthenticationSecret: secret
        });
    }
    async setIsTwoFactorAuthenticationIsEnabled(status, userId) {
        return this.usersRepository.update(userId, {
            isTwoFactorAuthenticationEnabled: status
        });
    }
    async addAvatar(userId, fileData) {
        const avatar = await this.localFilesService.saveLocalFileData(fileData);
        await this.usersRepository.update(userId, {
            avatar_id: avatar.id
        });
    }
    async getRelationships(userId) {
        const user = this.usersRepository.findOne(userId, {
            relations: [
                'sent_relationships'
            ]
        });
    }
};
UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.default)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        local_files_service_1.default])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map