import { forwardRef, Module } from '@nestjs/common';
import { PlayService } from './play.service';
import { PlayController } from './play.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayShowSaleModel } from './entities/play-show-sale.entity';
import { UploadModule } from 'src/upload/upload.module';
import { FileUploadModel } from 'src/upload/entities/file-upload.entity';
import { PlayTicketSaleModel } from './entities/play-ticket-sale.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlayTicketSaleModel,
      PlayShowSaleModel,
      FileUploadModel,
    ]),

  ],
  controllers: [PlayController],
  providers: [PlayService],
  exports: [PlayService],
})
export class PlayModule { }
