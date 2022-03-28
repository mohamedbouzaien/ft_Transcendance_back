import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FtAuthenticationGuard extends AuthGuard('42') {
}
