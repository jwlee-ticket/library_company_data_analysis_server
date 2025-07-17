import { Injectable, CanActivate, ExecutionContext, BadRequestException, Logger } from '@nestjs/common';

@Injectable()
export class SqlSecurityGuard implements CanActivate {
  private readonly logger = new Logger(SqlSecurityGuard.name);

  // 위험한 키워드 목록
  private readonly DANGEROUS_KEYWORDS = [
    'DROP', 'DELETE', 'INSERT', 'UPDATE', 'ALTER',
    'CREATE', 'TRUNCATE', 'GRANT', 'REVOKE',
    'EXEC', 'EXECUTE', 'CALL', 'PROCEDURE'
  ];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { query } = request.body;

    if (!query || typeof query !== 'string') {
      throw new BadRequestException('SQL 쿼리가 필요합니다.');
    }

    // 1. 기본 검증
    this.validateBasicQuery(query);

    // 2. SELECT 문만 허용
    this.validateSelectOnly(query);

    // 3. 위험한 키워드 차단
    this.validateDangerousKeywords(query);

    // 4. 세미콜론 다중 문장 차단
    this.validateSingleStatement(query);

    this.logger.log(`SQL 보안 검증 통과: ${query.substring(0, 50)}...`);
    return true;
  }

  private validateBasicQuery(query: string): void {
    if (query.trim().length === 0) {
      throw new BadRequestException('빈 쿼리는 실행할 수 없습니다.');
    }

    if (query.length > 5000) {
      throw new BadRequestException('쿼리는 5000자를 초과할 수 없습니다.');
    }
  }

  private validateSelectOnly(query: string): void {
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery.startsWith('select')) {
      throw new BadRequestException('SELECT 문만 실행 가능합니다.');
    }
  }

  private validateDangerousKeywords(query: string): void {
    const upperQuery = query.toUpperCase();
    
    for (const keyword of this.DANGEROUS_KEYWORDS) {
      // 단어 경계를 사용하여 정확한 키워드 매칭
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(query)) {
        throw new BadRequestException(`데이터 수정 쿼리는 실행할 수 없습니다. (${keyword})`);
      }
    }
  }

  private validateSingleStatement(query: string): void {
    // 세미콜론으로 구분된 다중 문장 차단 (문자열 내부 세미콜론 제외)
    const statements = this.splitSqlStatements(query);
    if (statements.length > 1) {
      throw new BadRequestException('한 번에 하나의 쿼리만 실행할 수 있습니다.');
    }
  }

  private splitSqlStatements(query: string): string[] {
    // 간단한 세미콜론 분할 (문자열 내부는 고려하지 않음)
    return query.split(';').filter(stmt => stmt.trim().length > 0);
  }
} 