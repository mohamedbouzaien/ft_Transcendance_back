import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export default class JwtTwoFactornGuard extends AuthGuard('jwt-two-factor') {}