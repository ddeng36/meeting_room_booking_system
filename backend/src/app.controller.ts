import { Controller, Get, SetMetadata } from '@nestjs/common';
import { AppService } from './app.service';
import { RequireLogin, RequirePermission, UserInfo } from './custom.decorator';
import { userInfo } from 'os';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('aaa')
  @RequireLogin()
  @RequirePermission('ddd')
  aaaa(@UserInfo('username') username: string, @UserInfo() userInfo) {
    console.log(username)
    console.log(userInfo)
      return 'aaa';
  }
  
  @Get('bbb')
  @SetMetadata('require-login', true)
  bbb() {
      return 'bbb';
  }
  
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
