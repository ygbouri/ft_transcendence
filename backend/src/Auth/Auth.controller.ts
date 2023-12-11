import {
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  Body,
  UseFilters,
} from '@nestjs/common';
import { AuthService } from './Auth.service';
import { Response } from 'express';
import { IntraAuthGuard } from './IntraAuth.guard';
import { CustomJwtAuthGuard } from '../2faJwt/jwt/JwtAuth.guard';
import { customJwt2faAuthGuard } from 'src/2faJwt/2fa/2faAuth.guard';
import { User } from 'src/User/User.decorator';
import { userParitalDto } from 'src/User/User.dto';
import { codeValidate, is2faEnabledValidate } from './Auth.dto';
import { HttpExceptionFilter } from './customException.filter';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/login')
  @UseGuards(IntraAuthGuard)
  @UseFilters(HttpExceptionFilter)
  async login(
    @User() user: userParitalDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.authenticateUser(user, res);
  }

  @Get('/logout')
  @UseGuards(CustomJwtAuthGuard)
  logout(
    @User() user: userParitalDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('jwt', { httpOnly: true });
    return { data: true };
  }

  @Get('/isAuthorized')
  @UseGuards(CustomJwtAuthGuard)
  isAuthorized() {
    return { data: true };
  }

  @Get('/is2faAuthorized')
  @UseGuards(customJwt2faAuthGuard)
  is2faAuthorized() {
    return { data: true };
  }

  @Get('/is2faEnabled')
  @UseGuards(CustomJwtAuthGuard)
  async is2faEnabled(@User() user: userParitalDto) {
    return await this.authService.is2faEnabled(user);
  }

  @Post('/2faEnabling')
  @UseGuards(CustomJwtAuthGuard)
  async enabling2fa(
    @User() user: userParitalDto,
    @Body() data: is2faEnabledValidate,
  ) {
    if (data.is2faEnabled === 'true')
      return await this.authService.generate2fa(user);
    this.authService.set2faEnabled(user, false);
    return { data: true };
  }

  @Post('/2faValidate')
  @UseGuards(CustomJwtAuthGuard)
  async validate2faCode(
    @User() user: userParitalDto,
    @Body() data: codeValidate,
  ) {
    const isValid = await this.authService.is2faCodeValid(user, data.code);
    if (isValid.err) return isValid;
    await this.authService.set2faEnabled(user, true);
    return { data: true };
  }

  @Get('/2faRedirect')
  @UseGuards(CustomJwtAuthGuard)
  redirect2fa(@Res({ passthrough: true }) res: Response) {
    this.authService.redirectProfile(res);
  }

  @Post('/2faLogin')
  @UseGuards(customJwt2faAuthGuard)
  async login2faCode(
    @User() user: userParitalDto,
    @Body() data: codeValidate,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isValid = await this.authService.is2faCodeValid(user, data.code);
    if (isValid.err) return isValid;
    this.authService.setJWTCookie(user, res);
    return { data: true };
  }
}
