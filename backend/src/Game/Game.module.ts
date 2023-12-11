import { Module } from '@nestjs/common';
import { GameService } from './Game.service';
import { GameController } from './Game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entity/Game.entity';
import { UserModule } from 'src/User/User.module';
import { GameGateway } from './Game.gateway';
import { FriendshipModule } from 'src/Friendship/Friendship.module';
import { JwtAuthModule } from 'src/2faJwt/jwt/JwtAuth.module';

@Module({
  providers: [GameService, GameGateway],
  controllers: [GameController],
  imports: [
    TypeOrmModule.forFeature([Game]),
    UserModule,
    FriendshipModule,
    JwtAuthModule,
  ],
})
export class GameModule {}
