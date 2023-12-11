import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class customJwt2faAuthGuard extends AuthGuard('jwt-2fa') {}
