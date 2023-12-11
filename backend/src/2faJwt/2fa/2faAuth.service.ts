import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { userParitalDto } from 'src/User/User.dto';

@Injectable()
export class Jwt2faAuthService {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  set2faJwt(user: userParitalDto) {
    return this.jwtService.sign(user);
  }
}
