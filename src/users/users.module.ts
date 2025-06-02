import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from './entities/user.entity';
import { LiveModel } from 'src/live/entities/live.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserModel,
      LiveModel,
    ],),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule { }
