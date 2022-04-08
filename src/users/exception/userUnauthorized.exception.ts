import { UnauthorizedException } from "@nestjs/common";

export class UserUnauthorizedException extends UnauthorizedException {
  constructor(userId: number) {
    super (`User with id ${userId} unauthorized`);
  }
}