import { Module } from '@nestjs/common';
import { ConcertService } from './concert.service';
import { ConcertController } from './concert.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConcertTicketSaleModel } from './entities/concert-ticket-sale.entity';
import { ConcertSeatSaleModel } from './entities/concert-seat-sale.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConcertTicketSaleModel,
      ConcertSeatSaleModel,
    ]),
  ],
  controllers: [ConcertController],
  providers: [ConcertService],
  exports: [ConcertService],
})
export class ConcertModule { }
