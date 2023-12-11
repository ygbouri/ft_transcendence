import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { userParitalDto } from 'src/User/User.dto';

@Injectable()
export class JwtAuthService {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  verify(token: string) {
    return this.jwtService.verify(
      token,
      this.configService.get('JWT_SECRET_KEY'),
    );
  }

  setJwt(user: userParitalDto) {
    return this.jwtService.sign(user);
  }
}
