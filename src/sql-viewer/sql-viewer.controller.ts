import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SqlViewerService } from './sql-viewer.service';
import { ExecuteSqlDto } from './dto/execute-sql.dto';
import { SqlSuccessResponseDto, SqlErrorResponseDto } from './dto/sql-response.dto';
import { SqlSecurityGuard } from './guards/sql-security.guard';

@ApiTags('SQL Viewer')
@Controller('sql-execute')
export class SqlViewerController {
  constructor(private readonly sqlViewerService: SqlViewerService) {}

  @Post()
  @UseGuards(SqlSecurityGuard)
  @ApiOperation({
    summary: 'SQL 쿼리 실행',
    description: 'SELECT 문만 허용되며, 보안 검증을 거친 후 실행됩니다.'
  })
  @ApiResponse({
    status: 200,
    description: 'SQL 실행 성공',
    type: SqlSuccessResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'SQL 실행 실패 또는 보안 위반',
    type: SqlErrorResponseDto
  })
  async executeSql(@Body() executeSqlDto: ExecuteSqlDto) {
    return this.sqlViewerService.executeSql(executeSqlDto);
  }

  @Get('tables')
  @ApiOperation({
    summary: '테이블 목록 조회',
    description: '데이터베이스의 모든 테이블 목록을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '테이블 목록 조회 성공',
    schema: {
      type: 'array',
      items: { type: 'string' },
      example: ['user_model', 'live_model', 'play_ticket_sale_model']
    }
  })
  async getTableList(): Promise<string[]> {
    return this.sqlViewerService.getTableList();
  }

  @Get('schema')
  @ApiOperation({
    summary: '전체 스키마 정보 조회',
    description: '모든 테이블의 컬럼 정보와 관계를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '스키마 정보 조회 성공'
  })
  async getAllTablesSchema() {
    return this.sqlViewerService.getAllTablesSchema();
  }

  @Get('table/:tableName')
  @ApiOperation({
    summary: '특정 테이블 상세 정보 조회',
    description: '지정된 테이블의 컬럼, 제약조건 등 상세 정보를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '테이블 상세 정보 조회 성공'
  })
  async getTableSchema(@Param('tableName') tableName: string) {
    return this.sqlViewerService.getTableSchema(tableName);
  }

  @Get('relationships')
  @ApiOperation({
    summary: '테이블 관계 정보 조회',
    description: 'Foreign Key 관계 정보를 조회하여 ERD 생성에 활용할 수 있습니다.'
  })
  @ApiResponse({
    status: 200,
    description: '테이블 관계 정보 조회 성공'
  })
  async getTableRelationships() {
    return this.sqlViewerService.getTableRelationships();
  }
} 