"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const todos_module_1 = require("./todos/todos.module");
const config_1 = require("@nestjs/config");
const database_module_1 = require("./database/database.module");
const users_module_1 = require("./users/users.module");
const authentication_module_1 = require("./authentication/authentication.module");
const two_factor_authentication_module_1 = require("./two-factor-authentication/two-factor-authentication.module");
const local_files_module_1 = require("./local-files/local-files.module");
const user_relationships_module_1 = require("./user-relationships/user-relationships.module");
const Joi = require("@hapi/joi");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [todos_module_1.TodosModule, config_1.ConfigModule.forRoot({
                validationSchema: Joi.object({
                    POSTGRES_HOST: Joi.string().required(),
                    POSTGRES_PORT: Joi.number().required(),
                    POSTGRES_USER: Joi.string().required(),
                    POSTGRES_PASSWORD: Joi.string().required(),
                    POSTGRES_DB: Joi.string().required(),
                    PORT: Joi.number(),
                    JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
                    JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
                    JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
                    JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
                    FT_AUTH_CLIENT_ID: Joi.string().required(),
                    FT_AUTH_CLIENT_SECRET: Joi.string().required(),
                    FRONT_URL: Joi.string().required(),
                    TWO_FACTOR_AUTHENTICATION_APP_NAME: Joi.string().required(),
                    UPLOADED_FILES_DESTINATION: Joi.string().required()
                })
            }), database_module_1.DatabaseModule, two_factor_authentication_module_1.TwoFactorAuthenticationModule, users_module_1.UsersModule, authentication_module_1.AuthenticationModule, local_files_module_1.LocalFilesModule, user_relationships_module_1.UserRelationshipsModule],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map