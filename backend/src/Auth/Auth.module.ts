import { Module } from '@nestjs/common';
import { AuthController } from './Auth.controller';
import { AuthService } from './Auth.service';
import { PassportModule } from '@nestjs/passport';
import { IntraStrategy } from './IntraAuth.strategy';
import { UserModule } from 'src/User/User.module';
import { JwtAuthModule } from 'src/2faJwt/jwt/JwtAuth.module';
import { Jwt2faAuthModule } from 'src/2faJwt/2fa/2faAuth.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, IntraStrategy],
  imports: [UserModule, JwtAuthModule, Jwt2faAuthModule, PassportModule],
})
export class AuthModule {}
