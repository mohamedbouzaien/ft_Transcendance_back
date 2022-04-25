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
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const local_files_service_1 = require("./local-files.service");
let LocalFilesController = class LocalFilesController {
    constructor(localFilesService) {
        this.localFilesService = localFilesService;
    }
    async getDatabaseFileById(id, response) {
        const file = await this.localFilesService.getFileById(id);
        const stream = (0, fs_1.createReadStream)((0, path_1.join)(process.cwd(), file.path));
        response.set({
            'Content-Disposition': `inline; filename="${file.filename}"`,
            'Content-Type': file.mimetype
        });
        return new common_1.StreamableFile(stream);
    }
};
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], LocalFilesController.prototype, "getDatabaseFileById", null);
LocalFilesController = __decorate([
    (0, common_1.Controller)('local-files'),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [local_files_service_1.default])
], LocalFilesController);
exports.default = LocalFilesController;
//# sourceMappingURL=local-files.controller.js.map