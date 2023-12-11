import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CustomJwtAuthGuard } from 'src/2faJwt/jwt/JwtAuth.guard';
import { User } from 'src/User/User.decorator';
import { userParitalDto } from 'src/User/User.dto';
import { loginValidate } from './Friendship.dto';
import { Service_of_friendship } from './Friendship.service';

@Controller('friendship')
export class FriendshipController {
  constructor(private readonly Service_of_friendship: Service_of_friendship) {}

  @Get('/friends')
  @UseGuards(CustomJwtAuthGuard)
  async getFriends(@User() user: userParitalDto) {
    return await this.Service_of_friendship.getFriends(user.login);
  }

  @Get('/onlineFriends')
  @UseGuards(CustomJwtAuthGuard)
  async getOnlineFriends(@User() user: userParitalDto) {
    return await this.Service_of_friendship.getOnlineFriends(user.login);
  }

  @Get('/requests')
  @UseGuards(CustomJwtAuthGuard)
  async getRequests(@User() user: userParitalDto) {
    return await this.Service_of_friendship.getRequests(user.login);
  }

  @Get('/pending')
  @UseGuards(CustomJwtAuthGuard)
  async getPending(@User() user: userParitalDto) {
    return await this.Service_of_friendship.getPending(user.login);
  }

  @Get('/blocked')
  @UseGuards(CustomJwtAuthGuard)
  async getBlocked(@User() user: userParitalDto) {
    return await this.Service_of_friendship.getBlocked(user.login);
  }

  @Post('/addFriend')
  @UseGuards(CustomJwtAuthGuard)
  async addFriend(@User() user: userParitalDto, @Body() data: loginValidate) {
    return await this.Service_of_friendship.addFriend(user.login, data.login);
  }

  @Post('/unfriend')
  @UseGuards(CustomJwtAuthGuard)
  async unfriend(@User() user: userParitalDto, @Body() data: loginValidate) {
    await this.Service_of_friendship.unfriend(user.login, data.login);
    return { data: true };
  }

  @Post('/acceptRequest')
  @UseGuards(CustomJwtAuthGuard)
  async acceptRequest(
    @User() user: userParitalDto,
    @Body() data: loginValidate,
  ) {
    const result = await this.Service_of_friendship.acceptRequest(
      user.login,
      data.login,
    );
    return { data: result };
  }

  @Post('/refuseRequest')
  @UseGuards(CustomJwtAuthGuard)
  async refuseRequest(
    @User() user: userParitalDto,
    @Body() data: loginValidate,
  ) {
    const result = await this.Service_of_friendship.refuseRequest(
      user.login,
      data.login,
    );
    return { data: result };
  }

  @Post('/cancelRequest')
  @UseGuards(CustomJwtAuthGuard)
  async cancelRequest(
    @User() user: userParitalDto,
    @Body() data: loginValidate,
  ) {
    const result = await this.Service_of_friendship.cancelRequest(
      user.login,
      data.login,
    );
    return { data: result };
  }

  @Post('/blockUser')
  @UseGuards(CustomJwtAuthGuard)
  async blockUser(@User() user: userParitalDto, @Body() data: loginValidate) {
    const result = await this.Service_of_friendship.blockUser(
      user.login,
      data.login,
    );
    return { data: result };
  }

  @Post('/unblock')
  @UseGuards(CustomJwtAuthGuard)
  async unblock(@User() user: userParitalDto, @Body() data: loginValidate) {
    const result = await this.Service_of_friendship.unblock(user.login, data.login);
    return { data: result };
  }
}
