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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const jwt_two_factor_guard_1 = require("../authentication/jwt-two-factor.guard");
const local_files_interceptor_1 = require("../local-files/local-files.interceptor");
const users_service_1 = require("./users.service");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async addAvatar(request, file) {
        return this.usersService.addAvatar(request.user.id, {
            path: file.path,
            filename: file.originalname,
            mimetype: file.mimetype
        });
    }
};
__decorate([
    (0, common_1.Post)('avatar'),
    (0, common_1.UseGuards)(jwt_two_factor_guard_1.default),
    (0, common_1.UseInterceptors)((0, local_files_interceptor_1.default)({
        fieldName: 'file',
        path: '/avatars',
        fileFilter: (request, file, callback) => {
            if (!file.mimetype.includes('image'))
                return callback(new common_1.BadRequestException('Provide a valid image'), false);
            callback(null, true);
        },
        limits: {
            fileSize: Math.pow(1024, 2)
        }
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addAvatar", null);
UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map