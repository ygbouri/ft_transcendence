import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './User/User.module';
import { AuthModule } from './Auth/Auth.module';
import { JwtAuthModule } from './2faJwt/jwt/JwtAuth.module';
import { Jwt2faAuthModule } from './2faJwt/2fa/2faAuth.module';
import { ConfigModule } from '@nestjs/config';
import { typeOrmConfigAsync } from './config/typeorm.config';
import { GameModule } from './Game/Game.module';
import { FriendshipModule } from './Friendship/Friendship.module';
import { NotificationModule } from './Header/Notification/Notification.module';
import { SearchModule } from './Header/Search/Search.module';
import { ChatModule } from './Chat/Chat.module';
import { CustomAppGateway } from './app.gateway';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  providers: [CustomAppGateway],
  imports: [
    UserModule,
    AuthModule,
    JwtAuthModule,
    Jwt2faAuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    ScheduleModule.forRoot(),
    GameModule,
    FriendshipModule,
    NotificationModule,
    SearchModule,
    ChatModule,
  ],
})
export class AppModule {}
