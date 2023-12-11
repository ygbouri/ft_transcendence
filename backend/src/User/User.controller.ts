import {
  Body,
  Controller,
  Get,
  UseGuards,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { updateProfileValidate, userParitalDto } from './User.dto';
import { UserService } from './User.service';
import { CustomJwtAuthGuard } from '../2faJwt/jwt/JwtAuth.guard';
import { User } from './User.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadUsersConfig } from 'src/config/upload.config';
import { loginValidate } from 'src/Friendship/Friendship.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/profileStyle')
  @UseGuards(CustomJwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar', uploadUsersConfig))
  async profileStyle(
    @User() user: userParitalDto,
    @UploadedFile() avatar: Express.Multer.File,
    @Body() data: updateProfileValidate,
  ) {
    return await this.userService.profileStyle(
      user.id,
      data.fullname,
      avatar?.filename,
      data.oldPath,
    );
  }
  
    @Get('/header/:login')
    @UseGuards(CustomJwtAuthGuard)
    async ft_get_header(
      @User() user: userParitalDto,
      @Param() data: loginValidate,
    ) {
      return await this.userService.ft_get_header(user.login, data.login);
    }

    @Get('/stats/:login')
    @UseGuards(CustomJwtAuthGuard)
    async ft_stats_user(
      @User() user: userParitalDto,
      @Param() data: loginValidate,
      ) {
        return await this.userService.ft_stats_user(user.login, data.login);
      }
      
      @Post('/ifexist')
      @UseGuards(CustomJwtAuthGuard)
      async userExist(@User() user: userParitalDto, @Body() data: loginValidate) {
        return await this.userService.userExist(user.login, data.login);
      }
  
  @Get('/leaderborad')
  @UseGuards(CustomJwtAuthGuard)
  async leaderBoard(@User() user: userParitalDto) {
    return await this.userService.ft_leader_get(user.login);
  }
  
  
  @Get('/info/:login')
  @UseGuards(CustomJwtAuthGuard)
  async ft_user_info(
    @User() user: userParitalDto,
    @Param() data: loginValidate,
  ) {
    return await this.userService.ft_user_info(user.login, data.login);
  }

  @Get('/achievements/:login')
  @UseGuards(CustomJwtAuthGuard)
  async achiev_add(
    @User() user: userParitalDto,
    @Param() data: loginValidate,
  ) {
    return await this.userService.achiev_add(user.login, data.login);
  }
}
