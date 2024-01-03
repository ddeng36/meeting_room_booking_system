import { Controller, Post, Body, Inject, Query, Get, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    await this.userService.register(registerUser);
    return 'Success to register the user';
  }

  @Get('register-captcha')
  async capthca(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(`captcha_${address}`, code, 5 * 60);
    await this.emailService.sendMail({
      to: address,
      subject: 'CAPTCHA',
      html: `<p>Your CAPTHCA is ${code}</p>`,
    });
    return 'success to send the CAPTCHA';
  }

  @Post('login')
  async userLogin(@Body() loginUser: LoginUserDto) {
    // 1. get vo from service
    const vo = await this.userService.login(loginUser, false);

    // 2. sign JWT token to vo
    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        roles: vo.userInfo.roles,
        permissions: vo.userInfo.permissions,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );

    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expres_time') || '7d',
      },
    );
      // 3. return vo
    return vo;
  }

  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, true);

    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        roles: vo.userInfo.roles,
        permissions: vo.userInfo.permissions,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );

    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expres_time') || '7d',
      },
    );

    return vo;
  }

  @Get('refresh')
  async refresh(@Query('refreshToken') refreshToken: string) {
      try {
        // 1. verify refresh token, throw error when token is invalid
        const data = this.jwtService.verify(refreshToken);
        // 2. get user from service
        const user = await this.userService.findUserById(data.userId, false);
        // 3. reasign the JWT token
        const access_token = this.jwtService.sign({
          userId: user.id,
          username: user.username,
          roles: user.roles,
          permissions: user.permissions
        }, {
          expiresIn: this.configService.get('jwt_access_token_expires_time') || '30m'
        });
  
        const refresh_token = this.jwtService.sign({
          userId: user.id
        }, {
          expiresIn: this.configService.get('jwt_refresh_token_expres_time') || '7d'
        });
  
        return {
          access_token,
          refresh_token
        }
      } catch(e) {
        throw new UnauthorizedException('Expired token, please login again');
      }
  }

  @Get('admin/refresh')
async adminRefresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);

      const user = await this.userService.findUserById(data.userId, true);

      const access_token = this.jwtService.sign({
        userId: user.id,
        username: user.username,
        roles: user.roles,
        permissions: user.permissions
      }, {
        expiresIn: this.configService.get('jwt_access_token_expires_time') || '30m'
      });

      const refresh_token = this.jwtService.sign({
        userId: user.id
      }, {
        expiresIn: this.configService.get('jwt_refresh_token_expires_time') || '7d'
      });

      return {
        access_token,
        refresh_token
      }
    } catch(e) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
}



  @Get('init-data')
  async initData() {
    await this.userService.initData();
    return 'success to init data';
  }
}
