import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class CustomJwtAuthGuard extends AuthGuard('jwt') {}
