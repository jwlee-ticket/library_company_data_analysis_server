import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConcertService } from './concert.service';
import { CreateConcertDto } from './dto/create-concert.dto';
import { UpdateConcertDto } from './dto/update-concert.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('concert')
@ApiTags('concert')
export class ConcertController {
  constructor(private readonly concertService: ConcertService) { }

  @Get('daily')
  @ApiOperation({ summary: '콘서트 일일 매출 데이터 조회' })
  @ApiResponse({ status: 200, description: '콘서트 일일 매출 데이터 목록' })
  async getConAllDaily() {
    return this.concertService.getConAllDaily();
  }

  @Get('overview')
  @ApiOperation({ summary: '콘서트 전체 개요 (어제/누적/주간 매출)' })
  @ApiResponse({ status: 200, description: '콘서트 전체 개요 데이터' })
  async getConAllOverview() {
    return this.concertService.getConAllOverview();
  }

  @Get('bep')
  @ApiOperation({ summary: '콘서트 BEP (손익분기점) 분석' })
  @ApiResponse({ status: 200, description: '콘서트 BEP 분석 데이터 목록 (좌석 등급별)' })
  async getConBep() {
    return this.concertService.getConBep();
  }

  @Get('estimated-profit')
  @ApiOperation({ summary: '콘서트 예상 수익' })
  @ApiResponse({ status: 200, description: '콘서트 예상 수익 데이터 목록' })
  async getConEstProfit() {
    return this.concertService.getConEstProfit();
  }

  @Get('target-sales')
  @ApiOperation({ summary: '콘서트 목표 매출' })
  @ApiResponse({ status: 200, description: '콘서트 목표 매출 데이터 목록' })
  async getConTargetSales() {
    return this.concertService.getConTargetSales();
  }

  @Get('marketing-calendar')
  @ApiOperation({ summary: '콘서트 주간 마케팅 캘린더' })
  @ApiResponse({ status: 200, description: '콘서트 마케팅 캘린더 목록' })
  async getConWeeklyMarketingCalendar() {
    return this.concertService.getConWeeklyMarketingCalendar();
  }

  @Get('monthly')
  @ApiOperation({ summary: '콘서트 월간 매출 데이터 (그래프용)' })
  @ApiResponse({ status: 200, description: '콘서트 월간 매출 데이터 목록 (liveId별 월별 집계)' })
  async getConMonthly() {
    return this.concertService.getConMonthly();
  }
}
