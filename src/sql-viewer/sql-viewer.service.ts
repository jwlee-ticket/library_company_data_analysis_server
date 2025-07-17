import { Injectable, Logger, RequestTimeoutException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ExecuteSqlDto } from './dto/execute-sql.dto';
import { SqlSuccessResponseDto, SqlErrorResponseDto } from './dto/sql-response.dto';

@Injectable()
export class SqlViewerService {
  private readonly logger = new Logger(SqlViewerService.name);
  private readonly QUERY_TIMEOUT = 30000; // 30초
  private readonly MAX_ROWS = 1000; // 최대 1000행

  constructor(
    private readonly dataSource: DataSource
  ) {}

  async executeSql(executeSqlDto: ExecuteSqlDto): Promise<SqlSuccessResponseDto | SqlErrorResponseDto> {
    const { query } = executeSqlDto;
    const startTime = Date.now();

    try {
      this.logger.log(`SQL 실행 시작: ${query.substring(0, 100)}...`);

      // LIMIT이 없는 경우 자동으로 추가
      const processedQuery = this.addLimitIfNeeded(query);

      // 타임아웃과 함께 쿼리 실행
      const results = await this.executeWithTimeout(processedQuery);
      
      const executionTime = Date.now() - startTime;
      const rowCount = Array.isArray(results) ? results.length : 0;

      this.logger.log(`SQL 실행 완료: ${rowCount}행, ${executionTime}ms`);

      return {
        success: true,
        results: results || [],
        rowCount,
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logger.error(`SQL 실행 실패 (${executionTime}ms): ${error.message}`);

      return {
        success: false,
        error: this.getErrorMessage(error),
        code: this.getErrorCode(error)
      };
    }
  }

  private async executeWithTimeout(query: string): Promise<any[]> {
    return Promise.race([
      this.dataSource.query(query),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new RequestTimeoutException('쿼리 실행 시간 초과 (30초)')), this.QUERY_TIMEOUT)
      )
    ]);
  }

  private addLimitIfNeeded(query: string): string {
    const lowerQuery = query.toLowerCase().trim();
    
    // 이미 LIMIT이 있는지 확인 (간단한 검사)
    if (lowerQuery.includes('limit')) {
      return query;
    }

    // SELECT 문 끝에 LIMIT 추가
    const trimmedQuery = query.trim();
    const hasTrailingSemicolon = trimmedQuery.endsWith(';');
    
    if (hasTrailingSemicolon) {
      return trimmedQuery.slice(0, -1) + ` LIMIT ${this.MAX_ROWS};`;
    } else {
      return trimmedQuery + ` LIMIT ${this.MAX_ROWS}`;
    }
  }

  private getErrorMessage(error: any): string {
    if (error instanceof RequestTimeoutException) {
      return error.message;
    }

    // PostgreSQL 에러 메시지 정리
    if (error.message) {
      // SQL 문법 에러 등의 경우 사용자 친화적 메시지로 변환
      if (error.message.includes('syntax error')) {
        return 'SQL 문법 오류가 있습니다. 쿼리를 확인해주세요.';
      }
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        return '존재하지 않는 테이블 또는 컬럼입니다.';
      }
      if (error.message.includes('permission denied')) {
        return '해당 테이블에 대한 권한이 없습니다.';
      }
    }

    return error.message || '쿼리 실행 중 오류가 발생했습니다.';
  }

  private getErrorCode(error: any): string {
    if (error instanceof RequestTimeoutException) {
      return 'EXECUTION_TIMEOUT';
    }

    if (error.message) {
      if (error.message.includes('syntax error')) {
        return 'SYNTAX_ERROR';
      }
      if (error.message.includes('does not exist')) {
        return 'OBJECT_NOT_FOUND';
      }
      if (error.message.includes('permission denied')) {
        return 'PERMISSION_DENIED';
      }
    }

    return 'EXECUTION_ERROR';
  }

  // 테스트용 메서드 - 테이블 목록 조회
  async getTableList(): Promise<string[]> {
    try {
      const result = await this.dataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      return result.map(row => row.table_name);
    } catch (error) {
      this.logger.error('테이블 목록 조회 실패:', error);
      return [];
    }
  }
} 