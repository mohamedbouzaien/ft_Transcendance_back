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
exports.UserPunishment = void 0;
const user_entity_1 = require("../../users/user.entity");
const typeorm_1 = require("typeorm");
const channel_entity_1 = require("./channel.entity");
var UserPunishment;
(function (UserPunishment) {
    UserPunishment["MUTE"] = "mute";
    UserPunishment["BAN"] = "ban";
    UserPunishment["NONE"] = "";
})(UserPunishment = exports.UserPunishment || (exports.UserPunishment = {}));
let ChannelPunishedUser = class ChannelPunishedUser {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ChannelPunishedUser.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserPunishment,
        default: UserPunishment.NONE
    }),
    __metadata("design:type", String)
], ChannelPunishedUser.prototype, "punishment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], ChannelPunishedUser.prototype, "end_of_sanction", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => channel_entity_1.default, (channel) => channel.channel_punished_users, { cascade: true, eager: true }),
    __metadata("design:type", channel_entity_1.default)
], ChannelPunishedUser.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.default, (user) => user.user_punished_channels, { cascade: true, eager: true }),
    __metadata("design:type", user_entity_1.default)
], ChannelPunishedUser.prototype, "user", void 0);
ChannelPunishedUser = __decorate([
    (0, typeorm_1.Entity)()
], ChannelPunishedUser);
exports.default = ChannelPunishedUser;
//# sourceMappingURL=channelPunishedUser.entity.js.map