import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlayService } from './play.service';
import { CreatePlayDto } from './dto/create-play.dto';
import { UpdatePlayDto } from './dto/update-play.dto';

@ApiTags('play')
@Controller('api/play')
export class PlayController {
  constructor(private readonly playService: PlayService) { }

  @Get('all-showtime')
  @ApiOperation({ 
    summary: '연극/뮤지컬 전체 공연 일정',
    description: '모든 공연 일정과 상세 정보 (캐스트, 좌석, 매출 등)'
  })
  @ApiResponse({ 
    status: 200, 
    description: '전체 공연 일정 조회 성공'
  })
  async getPlayAllShowtime() {
    return await this.playService.getPlayAllShowtime();
  }

  @Get('monthly-summary')
  @ApiOperation({ 
    summary: '연극/뮤지컬 월별 전체 매출',
    description: '최근 1년간 월별 매출 통계 및 전월 대비 증감률'
  })
  @ApiResponse({ 
    status: 200, 
    description: '월별 전체 매출 조회 성공'
  })
  async getPlayMonthlySummary() {
    return await this.playService.getPlayMonthlySummary();
  }

  @Get('monthly-by-performance')
  @ApiOperation({ 
    summary: '연극/뮤지컬 월별 공연별 매출',
    description: '최근 1년간 월별 각 공연의 매출 통계'
  })
  @ApiResponse({ 
    status: 200, 
    description: '월별 공연별 매출 조회 성공'
  })
  async getPlayMonthlyByPerformance() {
    return await this.playService.getPlayMonthlyByPerformance();
  }

  @Get('revenue-analysis')
  @ApiOperation({ 
    summary: '연극/뮤지컬 매출 분석',
    description: '총 매출, 목표 대비 실적, 최근 일자 매출 분석'
  })
  @ApiResponse({ 
    status: 200, 
    description: '매출 분석 조회 성공'
  })
  async getPlayRevenueAnalysis() {
    return await this.playService.getPlayRevenueAnalysis();
  }

  @Get('cast-revenue')
  @ApiOperation({ 
    summary: '연극/뮤지컬 캐스트별 매출',
    description: '캐스트별 매출 실적 및 공연 횟수'
  })
  @ApiResponse({ 
    status: 200, 
    description: '캐스트별 매출 조회 성공'
  })
  async getPlayCastRevenue() {
    return await this.playService.getPlayCastRevenue();
  }

  @Get('summary')
  @ApiOperation({ 
    summary: '연극/뮤지컬 대시보드 통합 데이터',
    description: '첫 번째 페이지에 필요한 모든 데이터를 통합하여 제공 (목표 대비 실적, 공연별 상세, 유료점유율)'
  })
  @ApiResponse({ 
    status: 200, 
    description: '연극/뮤지컬 통합 대시보드 데이터 조회 성공',
    schema: {
      type: 'object',
      properties: {
        weeklyOverview: {
          type: 'array',
          description: '카테고리별 총계 (목표 대비 실적)'
        },
        dailyDetails: {
          type: 'array', 
          description: '공연별 상세 정보'
        },
        occupancyRate: {
          type: 'array',
          description: '유료점유율 차트 데이터'
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          description: '데이터 조회 시간'
        }
      }
    }
  })
  async getPlaySummary() {
    return await this.playService.getPlaySummary();
  }

  @Get('weekly-overview')
  @ApiOperation({ 
    summary: '연극/뮤지컬 주간 목표 대비 실적',
    description: '목표점유율, 실제점유율, 목표매출, 실제매출 비교 데이터'
  })
  @ApiResponse({ 
    status: 200, 
    description: '주간 목표 대비 실적 조회 성공'
  })
  async getPlayWeeklyOverview() {
    return await this.playService.getPlayWeeklyOverview();
  }

  @Get('daily-details')
  @ApiOperation({ 
    summary: '연극/뮤지컬 공연별 상세 정보',
    description: '공연별 매출, 좌석 정보, 캐스트 등 상세 데이터'
  })
  @ApiResponse({ 
    status: 200, 
    description: '공연별 상세 정보 조회 성공'
  })
  async getPlayDailyDetails() {
    return await this.playService.getPlayDailyDetails();
  }

  @Get('occupancy-rate')
  @ApiOperation({ 
    summary: '연극/뮤지컬 유료 점유율',
    description: '주간별 유료 객석 점유율 차트 데이터'
  })
  @ApiResponse({ 
    status: 200, 
    description: '유료 점유율 데이터 조회 성공'
  })
  async getPlayOccupancyRate() {
    return await this.playService.getPlayOccupancyRate();
  }
}
