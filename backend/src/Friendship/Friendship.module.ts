import { forwardRef, Module } from '@nestjs/common';
import { Service_of_friendship } from './Friendship.service';
import { FriendshipController } from './Friendship.controller';
import { UserModule } from 'src/User/User.module';
import { Friendship } from './entity/Friendship.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from 'src/Header/Notification/Notification.module';
import { ChatModule } from 'src/Chat/Chat.module';

@Module({
  providers: [Service_of_friendship],
  controllers: [FriendshipController],
  imports: [
    TypeOrmModule.forFeature([Friendship]),
    forwardRef(() => UserModule),
    ChatModule,
    NotificationModule,
  ],
  exports: [Service_of_friendship],
})
export class FriendshipModule {}
