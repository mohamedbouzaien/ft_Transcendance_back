import { Injectable } from "@nestjs/common";
import { AuthenticationService } from "src/authentication/authentication.service";
import { UsersService } from "src/users/users.service";

@Injectable()
export class PongService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authenticationService: AuthenticationService
  ) {}

  
}