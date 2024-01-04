import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { md5 } from 'src/utils';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginUserVo } from './vo/login-user.vo';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/udpate-user.dto';
@Injectable()
export class UserService {
  private logger: Logger = new Logger();

  @InjectRepository(User)
  private userRepository: Repository<User>;

  @InjectRepository(Role)
  private roleRepository: Repository<Role>;

  @InjectRepository(Permission)
  private permissionRepository: Repository<Permission>;

  @Inject(RedisService)
  private redisService: RedisService;

  async register(user: RegisterUserDto) {
    // 1. check if CAPTCHA is valid? (expired?, match?)
    const captcha = await this.redisService.get(`captcha_${user.username}`);
    if (!captcha) {
      throw new HttpException('CAPTCHA is expired', HttpStatus.BAD_REQUEST);
    }
    if (captcha !== user.captcha) {
      throw new HttpException('CAPTCHA is not match', HttpStatus.BAD_REQUEST);
    }

    // 2. check if username is already exist
    const foundUser = await this.userRepository.findOneBy({
      username: user.username,
    });
    if (foundUser) {
      throw new HttpException(
        'Username is already exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 3. save user to database
    const newUser = new User();
    newUser.username = user.username;
    newUser.password = user.password;
    newUser.email = user.email;
    newUser.nickName = user.nickName;

    try {
      await this.userRepository.save(newUser);
      return 'Success to register the user';
    } catch (e) {
      throw new HttpException(
        'Fail to register the user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(loginUserDto: LoginUserDto, isAdmin: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginUserDto.username,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) {
      throw new HttpException("User doesn't exist!", HttpStatus.BAD_REQUEST);
    }

    if (user.password !== md5(loginUserDto.password)) {
      throw new HttpException('Wrong password!', HttpStatus.BAD_REQUEST);
    }
    const vo = new LoginUserVo();
    vo.userInfo = {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      headPic: user.headPic,
      createTime: user.createTime.getTime(),
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };
    return vo;
  }
  async findUserDetailById(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    return user;
  }
  async findUserById(userId: number, isAdmin: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });

    return {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };
  }

  async updatePassword(userId: number, passwordDto: UpdateUserPasswordDto){
    // 1. check if CAPTCHA is valid? (expired?, match?)
    const captcha = await this.redisService.get(`update_password_captcha_${passwordDto.email}`);
    if (!captcha) {
      throw new HttpException('CAPTCHA is expired', HttpStatus.BAD_REQUEST);
    }
    if (captcha !== passwordDto.captcha) {
      throw new HttpException('CAPTCHA is not match', HttpStatus.BAD_REQUEST);
    }

    // 2. find user's object and modify it's password
    const foundUser = await this.userRepository.findOneBy({
      id: userId
    });
    foundUser.password = md5(passwordDto.password);

    // 3. save user to database
    try{
      this.userRepository.save(foundUser);
      return 'Success to update password';
    }catch(e){
      this.logger.error(e,UserService.name);
      throw new HttpException('Fail to update password', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
    // 1. check if CAPTCHA is valid? (expired?, match?)
    const captcha = await this.redisService.get(`update_user_captcha_${updateUserDto.email}`);
    if (!captcha) {
      throw new HttpException('CAPTCHA is expired', HttpStatus.BAD_REQUEST);
    }
    if (captcha !== updateUserDto.captcha) {
      throw new HttpException('CAPTCHA is not match', HttpStatus.BAD_REQUEST);
    }

    // 2. find user's object and modify the info if it's not empty
    const foundUser = await this.userRepository.findOneBy({
      id: userId
    });
    if(updateUserDto.headPic){
      foundUser.headPic = updateUserDto.headPic;
    }
    if(updateUserDto.nickName){
      foundUser.nickName = updateUserDto.nickName;
    }

    // 3. save user to database
    try{
      this.userRepository.save(foundUser);
      return 'Success to update user info';
    }catch(e){
      this.logger.error(e,UserService.name);
      throw new HttpException('Fail to update user info', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async initData() {
    const user1 = new User();
    user1.username = 'zhangsan';
    user1.password = md5('111111');
    user1.email = 'xxx@xx.com';
    user1.isAdmin = true;
    user1.nickName = '张三';
    user1.phoneNumber = '13233323333';

    const user2 = new User();
    user2.username = 'lisi';
    user2.password = md5('222222');
    user2.email = 'yy@yy.com';
    user2.nickName = '李四';

    const role1 = new Role();
    role1.name = '管理员';

    const role2 = new Role();
    role2.name = '普通用户';

    const permission1 = new Permission();
    permission1.code = 'ccc';
    permission1.description = '访问 ccc 接口';

    const permission2 = new Permission();
    permission2.code = 'ddd';
    permission2.description = '访问 ddd 接口';

    user1.roles = [role1];
    user2.roles = [role2];

    role1.permissions = [permission1, permission2];
    role2.permissions = [permission1];

    await this.permissionRepository.save([permission1, permission2]);
    await this.roleRepository.save([role1, role2]);
    await this.userRepository.save([user1, user2]);
  }
}
