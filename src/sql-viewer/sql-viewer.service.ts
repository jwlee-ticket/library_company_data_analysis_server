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

  // 🆕 테이블 스키마 정보 조회
  async getTableSchema(tableName: string): Promise<any> {
    try {
      const columnInfo = await this.dataSource.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      const constraints = await this.dataSource.query(`
        SELECT 
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        LEFT JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_schema = 'public' 
          AND tc.table_name = $1
      `, [tableName]);

      return {
        tableName,
        columns: columnInfo,
        constraints: constraints
      };
    } catch (error) {
      this.logger.error(`테이블 스키마 조회 실패 (${tableName}):`, error);
      throw error;
    }
  }

  // 🆕 전체 스키마 정보 조회 (간소화된 버전)
  async getAllTablesSchema(): Promise<any> {
    try {
      const tablesInfo = await this.dataSource.query(`
        SELECT 
          t.table_name,
          c.column_name,
          c.data_type,
          c.is_nullable,
          c.column_default,
          CASE 
            WHEN tc.constraint_type = 'PRIMARY KEY' THEN 'PK'
            WHEN tc.constraint_type = 'FOREIGN KEY' THEN 'FK'
            ELSE NULL 
          END as key_type,
          ccu.table_name AS references_table,
          ccu.column_name AS references_column
        FROM information_schema.tables t
        LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
        LEFT JOIN information_schema.key_column_usage kcu ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name
        LEFT JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
        LEFT JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE t.table_schema = 'public'
          AND c.table_schema = 'public'
        ORDER BY t.table_name, c.ordinal_position
      `);

      // 테이블별로 그룹화
      const schemaMap = new Map();
      
      tablesInfo.forEach(row => {
        if (!schemaMap.has(row.table_name)) {
          schemaMap.set(row.table_name, {
            tableName: row.table_name,
            columns: []
          });
        }
        
        const table = schemaMap.get(row.table_name);
        const existingColumn = table.columns.find(col => col.column_name === row.column_name);
        
        if (!existingColumn) {
          table.columns.push({
            column_name: row.column_name,
            data_type: row.data_type,
            is_nullable: row.is_nullable,
            column_default: row.column_default,
            key_type: row.key_type,
            references_table: row.references_table,
            references_column: row.references_column
          });
        }
      });

      return Array.from(schemaMap.values());
    } catch (error) {
      this.logger.error('전체 스키마 조회 실패:', error);
      throw error;
    }
  }

  // 🆕 테이블 관계 정보 조회 (ERD용)
  async getTableRelationships(): Promise<any> {
    try {
      const relationships = await this.dataSource.query(`
        SELECT DISTINCT
          tc.table_name AS source_table,
          kcu.column_name AS source_column,
          ccu.table_name AS target_table,
          ccu.column_name AS target_column,
          tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
        ORDER BY tc.table_name
      `);

      return relationships;
    } catch (error) {
      this.logger.error('테이블 관계 조회 실패:', error);
      throw error;
    }
  }
} 