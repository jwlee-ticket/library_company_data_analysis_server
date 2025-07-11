import { forwardRef, Module } from '@nestjs/common';
import { PlayService } from './play.service';
import { PlayController } from './play.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayShowSaleModel } from './entities/play-show-sale.entity';
import { UploadModule } from 'src/upload/upload.module';
import { FileUploadModel } from 'src/upload/entities/file-upload.entity';
import { PlayTicketSaleModel } from './entities/play-ticket-sale.entity';
// 연극/뮤지컬 대시보드용 뷰 엔티티들 import
import { ViewLlmPlayWeeklyA } from 'src/report/entities/view-llm-play-weekly-a.entity';
import { ViewLlmPlayDaily } from 'src/report/entities/view-llm-play-daily.entity';
import { ViewLlmPlayWeeklyPaidshare } from 'src/report/entities/view_llm_play_weekly_paidshare.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // 기존 엔티티들
      PlayTicketSaleModel,
      PlayShowSaleModel,
      FileUploadModel,
      // 연극/뮤지컬 대시보드용 뷰 엔티티들
      ViewLlmPlayWeeklyA,
      ViewLlmPlayDaily,
      ViewLlmPlayWeeklyPaidshare,
    ]),
  ],
  controllers: [PlayController],
  providers: [PlayService],
  exports: [PlayService],
})
export class PlayModule { }
