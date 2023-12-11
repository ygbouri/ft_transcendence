import { Module } from '@nestjs/common';
import { UserService } from './User.service';
import { UserController } from './User.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/User.entity';
import { Stats } from './entity/Stats.entity';
import { JwtAuthModule } from 'src/2faJwt/jwt/JwtAuth.module';
import { FriendshipModule } from 'src/Friendship/Friendship.module';

@Module({
  providers: [UserService],
  controllers: [UserController],
  imports: [
    TypeOrmModule.forFeature([User, Stats]),
    JwtAuthModule,
    FriendshipModule,
  ],
  exports: [UserService],
})
export class UserModule {}
