import { forwardRef, Module } from '@nestjs/common';
import { ChatService } from './Chat.service';
import { ChatController } from './Chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthModule } from 'src/2faJwt/jwt/JwtAuth.module';
import { UserModule } from 'src/User/User.module';
import { Conversation, Member, Message } from './entity/Chat.entity';
import { ChatGateway } from './Chat.gateway';
import { FriendshipModule } from 'src/Friendship/Friendship.module';

@Module({
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
  imports: [
    TypeOrmModule.forFeature([Message, Conversation, Member]),
    JwtAuthModule,
    forwardRef(() => UserModule),
    forwardRef(() => FriendshipModule),
  ],
  exports: [ChatService],
})
export class ChatModule {}
