import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './entities/user.entity';
import { Repository } from 'typeorm';
import { LiveModel } from 'src/live/entities/live.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    @InjectRepository(LiveModel)
    private readonly liveRepository: Repository<LiveModel>,
  ) { }

  async createAccount(createUserDto: CreateUserDto) {
    try {
      const user = this.userRepository.create(createUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async login(data: any) {
    try {
      const { email, password } = data;
      const userInfo = await this.userRepository.findOne({ where: { email, password, status: true }, });

      if (!userInfo) {
        return { code: 400, message: "Invalid email or password" };
      }

      return { code: 200, message: "Login success", userId: userInfo.id, name: userInfo.name, role: userInfo.role, isFileUploader: userInfo.isFileUploader, isLiveManager: userInfo.isLiveManager, liveNameList: userInfo.liveNameList ?? [] };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getUsers() {
    try {
      const userInfo = await this.userRepository.find();


      userInfo.sort((a, b) => {
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

      userInfo.sort((a, b) => {
        return a.role - b.role;
      });

      return userInfo;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getLiveList() {
    try {
      const liveInfo = await this.liveRepository.find({ where: { isLive: true } });
      const liveNames = liveInfo.map((live) => live.liveName);
      return liveNames;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async deleteUser(id: number) {
    try {
      const userInfo = await this.userRepository.findOne({ where: { id } });

      if (!userInfo) {
        return { code: 400, message: "User not found" };
      }

      await this.userRepository.remove(userInfo);

      return { code: 200, message: "User deleted" };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async editUser(updateUserDto: UpdateUserDto) {
    try {
      const { id, ...rest } = updateUserDto;
      const userInfo = await this.userRepository.findOne({ where: { id } });

      if (!userInfo) {
        return { code: 400, message: "User not found" };
      }


      if (rest.role === 0 || rest.role === 1) {
        rest.isFileUploader = true;
        rest.isLiveManager = true;
        rest.status = true;
        rest.liveNameList = ['전체'];
      }

      await this.userRepository.update({ id }, rest);

      return { code: 200, message: "User updated" };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
