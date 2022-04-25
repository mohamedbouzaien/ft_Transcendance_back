"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
let WsExceptionFilter = class WsExceptionFilter {
    catch(exception, host) {
        const client = host.switchToWs().getClient();
        this.handleError(client, exception);
    }
    handleError(client, exception) {
        if (exception instanceof common_1.HttpException) {
            console.log(exception);
            client.emit('error', exception);
        }
        else {
            console.log(exception);
            client.emit('error', exception);
        }
    }
};
WsExceptionFilter = __decorate([
    (0, common_1.Catch)(websockets_1.WsException, common_1.HttpException)
], WsExceptionFilter);
exports.WsExceptionFilter = WsExceptionFilter;
//# sourceMappingURL=WsException.filter.js.map