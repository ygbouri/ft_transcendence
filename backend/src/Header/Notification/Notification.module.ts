import { forwardRef, Module } from '@nestjs/common';
import { NotificationGateway } from './Notification.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entity/Notification.entity';
import { NotificationService } from './Notification.service';
import { JwtAuthModule } from 'src/2faJwt/jwt/JwtAuth.module';
import { UserModule } from 'src/User/User.module';

@Module({
  providers: [NotificationGateway, NotificationService],
  imports: [
    TypeOrmModule.forFeature([Notification]),
    JwtAuthModule,
    forwardRef(() => UserModule),
  ],
  exports: [NotificationGateway, NotificationService],
})
export class NotificationModule {}
