import { Module } from '@nestjs/common';
import { TargetService } from './target.service';
import { TargetController } from './target.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveModel } from 'src/live/entities/live.entity';
import { DailyTargetModel } from './entities/daily-target.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LiveModel,
      DailyTargetModel,
    ]),
  ],
  controllers: [TargetController],
  providers: [TargetService],
  exports: [TargetService],
})
export class TargetModule { }
