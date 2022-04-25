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
exports.SquaresServices = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const square_entity_1 = require("../entities/square.entity");
let SquaresServices = class SquaresServices {
    constructor(squaresrepository) {
        this.squaresrepository = squaresrepository;
    }
    async create(side) {
        const dto = { side };
        const square = await this.squaresrepository.create(Object.assign({}, dto));
        const newSquare = await this.squaresrepository.save(square);
        if (!newSquare) {
            throw new common_1.HttpException('cant create circle', common_1.HttpStatus.BAD_REQUEST);
        }
        console.log(newSquare);
        return newSquare;
    }
    async get(id) {
        return await this.squaresrepository.findOne(id);
    }
};
SquaresServices = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(square_entity_1.default)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SquaresServices);
exports.SquaresServices = SquaresServices;
//# sourceMappingURL=square.service.js.map