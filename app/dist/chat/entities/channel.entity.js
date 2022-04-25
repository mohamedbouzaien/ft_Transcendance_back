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
exports.ChannelStatus = void 0;
const class_transformer_1 = require("class-transformer");
const user_entity_1 = require("../../users/user.entity");
const typeorm_1 = require("typeorm");
const channelUser_entity_1 = require("./channelUser.entity");
const message_entity_1 = require("./message.entity");
var ChannelStatus;
(function (ChannelStatus) {
    ChannelStatus["PRIVATE"] = "private";
    ChannelStatus["PUBLIC"] = "public";
    ChannelStatus["DIRECT_MESSAGE"] = "direct_message";
})(ChannelStatus = exports.ChannelStatus || (exports.ChannelStatus = {}));
let Channel = class Channel {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Channel.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Channel.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ChannelStatus,
        default: ChannelStatus.PUBLIC
    }),
    __metadata("design:type", String)
], Channel.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], Channel.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => channelUser_entity_1.default, (channelUser) => channelUser.channel, { cascade: true }),
    __metadata("design:type", Array)
], Channel.prototype, "channelUsers", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => user_entity_1.default, (invited_member) => invited_member.invited_channels, { cascade: true }),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Channel.prototype, "invited_members", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.default, (message) => message.channel),
    __metadata("design:type", Array)
], Channel.prototype, "messages", void 0);
Channel = __decorate([
    (0, typeorm_1.Entity)()
], Channel);
exports.default = Channel;
//# sourceMappingURL=channel.entity.js.map