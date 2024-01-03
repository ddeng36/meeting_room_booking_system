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
@Injectable()
export class UserService {
  private logger: Logger = new Logger();

  @InjectRepository(User)
  private userRepository: Repository<User>;

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
      throw new HttpException('Username is already exist', HttpStatus.BAD_REQUEST);
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
    }catch(e) {
      throw new HttpException('Fail to register the user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
