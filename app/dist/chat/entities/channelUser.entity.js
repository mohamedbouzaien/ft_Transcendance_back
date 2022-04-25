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
exports.SanctionType = exports.ChannelUserRole = void 0;
const user_entity_1 = require("../../users/user.entity");
const typeorm_1 = require("typeorm");
const channel_entity_1 = require("./channel.entity");
var ChannelUserRole;
(function (ChannelUserRole) {
    ChannelUserRole[ChannelUserRole["OWNER"] = 3] = "OWNER";
    ChannelUserRole[ChannelUserRole["ADMIN"] = 2] = "ADMIN";
    ChannelUserRole[ChannelUserRole["USER"] = 1] = "USER";
})(ChannelUserRole = exports.ChannelUserRole || (exports.ChannelUserRole = {}));
var SanctionType;
(function (SanctionType) {
    SanctionType["MUTE"] = "mute";
    SanctionType["BAN"] = "ban";
    SanctionType["NONE"] = "";
})(SanctionType = exports.SanctionType || (exports.SanctionType = {}));
let ChannelUser = class ChannelUser {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ChannelUser.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ChannelUserRole,
        default: ChannelUserRole.USER
    }),
    __metadata("design:type", Number)
], ChannelUser.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SanctionType,
        nullable: true
    }),
    __metadata("design:type", String)
], ChannelUser.prototype, "sanction", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], ChannelUser.prototype, "end_of_sanction", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => channel_entity_1.default, (channel) => channel.channelUsers, { onDelete: 'CASCADE', eager: true }),
    __metadata("design:type", channel_entity_1.default)
], ChannelUser.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.default, (user) => user.userChannels, { eager: true }),
    __metadata("design:type", user_entity_1.default)
], ChannelUser.prototype, "user", void 0);
ChannelUser = __decorate([
    (0, typeorm_1.Entity)()
], ChannelUser);
exports.default = ChannelUser;
//# sourceMappingURL=channelUser.entity.js.map