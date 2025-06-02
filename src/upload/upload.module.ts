import { forwardRef, Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUploadModel } from './entities/file-upload.entity';
import { PlayModule } from 'src/play/play.module';
import { PlayTicketSaleModel } from 'src/play/entities/play-ticket-sale.entity';
import { PlayShowSaleModel } from 'src/play/entities/play-show-sale.entity';
import { LiveModel } from 'src/live/entities/live.entity';
import { ConcertTicketSaleModel } from 'src/concert/entities/concert-ticket-sale.entity';
import { ConcertSeatSaleModel } from 'src/concert/entities/concert-seat-sale.entity';
import { ConcertModule } from 'src/concert/concert.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FileUploadModel,
      PlayTicketSaleModel,
      PlayShowSaleModel,
      LiveModel,
      ConcertTicketSaleModel,
      ConcertSeatSaleModel,
    ]),
    forwardRef(() => PlayModule),
    forwardRef(() => ConcertModule),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule { }
