import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Inject,
  Req,
  Res,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';

import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { registerCaptchaDto } from './dto/register-captcha.dto';

import { UsersService } from './users.service';
import { EmailService } from '../email/email.service';
import { RedisService } from '../redis/redis.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(JwtService)
  private jwtService: JwtService;

  private buildAccessToken(userInfo: {
    id: number;
    userName: string;
    nickName: string;
  }) {
    return this.jwtService.sign(
      {
        userName: userInfo.userName,
        nickName: userInfo.nickName,
        userId: userInfo.id,
      },
      {
        expiresIn: '15m',
      },
    );
  }

  private buildRefreshToken(userInfo: {
    id: number;
    userName: string;
    nickName: string;
  }) {
    return this.jwtService.sign(
      {
        userName: userInfo.userName,
        nickName: userInfo.nickName,
        userId: userInfo.id,
        tokenType: 'refresh',
      },
      {
        expiresIn: '7d',
      },
    );
  }

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return await this.usersService.register(registerUserDto);
  }

  @Get('register-captcha')
  async sendCaptcha(@Query() { address }: registerCaptchaDto) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(`captcha_${address}`, code, 60 * 5);
    await this.emailService.sendEmail({
      to: address,
      subject: '注册验证码',
      html: `<p>你的注册验证码是 ${code}</p>`,
    });
    return {
      message: '验证码发送成功',
      data: {},
    };
  }

  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userInfo = await this.usersService.login(loginUserDto);
    const accessToken = this.buildAccessToken(userInfo);
    const refreshToken = this.buildRefreshToken(userInfo);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/users',
    });

    return {
      message: '登录成功',
      data: {
        userName: userInfo.userName,
        nickName: userInfo.nickName,
        token: accessToken,
      },
    };
  }

  @Post('refresh-token')
  async refreshToken(@Req() req: Request) {
    const token = req.cookies?.refresh_token as string | undefined;

    if (!token) {
      return {
        message: 'refresh token 缺失',
        data: {},
      };
    }

    const payload = this.jwtService.verify<{
      userName: string;
      nickName: string;
      userId: number;
      tokenType?: string;
    }>(token);

    if (payload.tokenType !== 'refresh') {
      return {
        message: 'refresh token 无效',
        data: {},
      };
    }

    const accessToken = this.jwtService.sign(
      {
        userName: payload.userName,
        nickName: payload.nickName,
        userId: payload.userId,
      },
      {
        expiresIn: '15m',
      },
    );

    return {
      message: '刷新成功',
      data: {
        token: accessToken,
      },
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', {
      path: '/users',
    });

    return {
      message: '退出成功',
      data: {},
    };
  }
}
