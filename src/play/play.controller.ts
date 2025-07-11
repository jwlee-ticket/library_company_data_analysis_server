import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlayService } from './play.service';
import { CreatePlayDto } from './dto/create-play.dto';
import { UpdatePlayDto } from './dto/update-play.dto';

@ApiTags('play')
@Controller('play')
export class PlayController {
  constructor(private readonly playService: PlayService) { }

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
