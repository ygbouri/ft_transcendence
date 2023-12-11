import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Jwt2faAuthService } from './2faAuth.service';
import { Jwt2faAuthStrategy } from './2faAuth.strategy';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('2FA_JWT_SECRET_KEY'),
        signOptions: { expiresIn: 60 * 5 },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [Jwt2faAuthService, Jwt2faAuthStrategy],
  exports: [Jwt2faAuthService],
})
export class Jwt2faAuthModule {}
