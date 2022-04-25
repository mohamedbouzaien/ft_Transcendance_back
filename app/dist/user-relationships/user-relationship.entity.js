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
Object.defineProperty(exports, "__esModule", { value: true });
const user_entity_1 = require("../users/user.entity");
const typeorm_1 = require("typeorm");
const user_relationship_status_enum_1 = require("./user-relationship-status.enum");
let UserRelationship = class UserRelationship {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserRelationship.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UserRelationship.prototype, "issuer_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.default, (issuer) => issuer.sent_relationships),
    (0, typeorm_1.JoinColumn)({ name: 'issuer_id' }),
    __metadata("design:type", user_entity_1.default)
], UserRelationship.prototype, "issuer", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UserRelationship.prototype, "receiver_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.default, (receiver) => receiver.received_relationships),
    (0, typeorm_1.JoinColumn)({ name: 'receiver_id' }),
    __metadata("design:type", user_entity_1.default)
], UserRelationship.prototype, "receiver", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: user_relationship_status_enum_1.UserRelationshipStatus,
        default: user_relationship_status_enum_1.UserRelationshipStatus.PENDING
    }),
    __metadata("design:type", Number)
], UserRelationship.prototype, "status", void 0);
UserRelationship = __decorate([
    (0, typeorm_1.Entity)()
], UserRelationship);
exports.default = UserRelationship;
//# sourceMappingURL=user-relationship.entity.js.map