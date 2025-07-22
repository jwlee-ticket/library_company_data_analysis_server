import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { SqlViewerService } from '../sql-viewer/sql-viewer.service';
import { ChatMessage, ChatSession, SqlAnalysis } from './interfaces/chat.interface';
import { ChatRequestDto, SqlExecutionRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto, SqlExecutionResponseDto } from './dto/chat-response.dto';

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);
  private readonly openai: OpenAI;
  private chatSessions: Map<string, ChatSession> = new Map(); // 메모리 저장 (임시)

  constructor(
    private readonly configService: ConfigService,
    private readonly sqlViewerService: SqlViewerService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async processChat(chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`AI Chat 요청 시작: ${chatRequest.message.substring(0, 100)}...`);

      // 세션 ID가 없으면 새로 생성
      const sessionId = chatRequest.sessionId || this.generateSessionId();
      
      // 채팅 세션 가져오기 또는 생성
      let session = this.chatSessions.get(sessionId);
      if (!session) {
        session = this.createNewSession(sessionId);
        this.chatSessions.set(sessionId, session);
      }

      // 사용자 메시지 추가
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: chatRequest.message,
        timestamp: new Date(),
      };
      session.messages.push(userMessage);

      // 시스템 프롬프트 구성
      const systemPrompt = await this.buildSystemPrompt();
      
      // OpenAI API 호출을 위한 메시지 구성
      const messages = [
        { role: 'system', content: systemPrompt },
        ...session.messages.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      ];

      // OpenAI API 호출
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const aiContent = response.choices[0].message.content.trim();
      const tokensUsed = response.usage?.total_tokens;

      // SQL 분석
      const sqlAnalysis = this.analyzeSqlFromResponse(aiContent);

      // AI 응답 메시지 생성
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
        sqlQuery: sqlAnalysis.query,
      };
      session.messages.push(aiMessage);

      // 세션 업데이트
      session.updatedAt = new Date();
      this.chatSessions.set(sessionId, session);

      const responseTime = Date.now() - startTime;
      this.logger.log(`AI Chat 응답 완료: ${responseTime}ms, 토큰: ${tokensUsed}`);

      return {
        success: true,
        message: aiMessage,
        sessionId,
        sqlAnalysis,
        tokensUsed,
        responseTime,
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error(`AI Chat 처리 실패 (${responseTime}ms):`, {
        message: error.message,
        stack: error.stack,
        name: error.name,
        openaiError: error.response?.data || null
      });
      
      return {
        success: false,
        message: {
          id: uuidv4(),
          role: 'assistant',
          content: `죄송합니다. 처리 중 오류가 발생했습니다: ${error.message}`,
          timestamp: new Date(),
        },
        sessionId: chatRequest.sessionId || 'error',
      } as any;
    }
  }

  async executeSql(sqlRequest: SqlExecutionRequestDto): Promise<SqlExecutionResponseDto> {
    try {
      this.logger.log(`SQL 실행 요청: ${sqlRequest.query}`);

      // SQL Viewer 서비스를 통해 실행
      const result = await this.sqlViewerService.executeSql({ query: sqlRequest.query });

      if (result.success) {
        return {
          success: true,
          results: (result as any).results,
          executionTime: (result as any).executionTime,
          rowCount: (result as any).rowCount,
        };
      } else {
        return {
          success: false,
          error: (result as any).error,
          code: (result as any).code,
        };
      }
    } catch (error) {
      this.logger.error(`SQL 실행 실패: ${error.message}`);
      return {
        success: false,
        error: error.message,
        code: 'EXECUTION_ERROR',
      };
    }
  }

  async getSessions(): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    return this.chatSessions.get(sessionId) || null;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return this.chatSessions.delete(sessionId);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createNewSession(sessionId: string): ChatSession {
    return {
      id: sessionId,
      title: '새 채팅',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async buildSystemPrompt(): Promise<string> {
    try {
      // SQL Viewer에서 전체 스키마 정보 가져오기
      const allTablesSchema = await this.sqlViewerService.getAllTablesSchema();
      
      // 사용 가능한 모든 테이블 목록 생성
      const allowedTables = allTablesSchema.map(table => table.tableName);
      
      // 모든 테이블의 컬럼 정보 생성 (간결하게)
      const tableStructures = allTablesSchema
        .map(table => {
          // 핵심 컬럼 정보만 포함 (PK, FK, 주요 컬럼)
          const keyColumns = table.columns
            .map(col => {
              let columnInfo = `${col.column_name}(${col.data_type})`;
              if (col.key_type === 'PK') columnInfo += '[PK]';
              if (col.key_type === 'FK') columnInfo += `[FK→${col.references_table}]`;
              return columnInfo;
            })
            .join(', ');
          
          return `• ${table.tableName}:\n  ${keyColumns}`;
        })
        .join('\n\n');

      return `당신은 LibraryCompany의 데이터베이스 SQL 전문가입니다.

**전체 데이터베이스 스키마 (총 ${allowedTables.length}개 테이블):**

${tableStructures}

**뷰 테이블 카테고리:**
- view_con_*: 콘서트 관련 분석 뷰
- view_play_*: 연극 & 뮤지컬 전체 분석 뷰  
- view_llm_play_*: 연극 & 뮤지컬 LLM 분석 뷰

**역할:**
1. 사용자의 자연어 요청을 정확한 SQL 쿼리로 변환
2. SELECT 문만 생성 (데이터 조회만 허용)
3. 자동으로 LIMIT 1000 추가 (성능 보호)
4. 쿼리 설명과 주의사항 제공

응답 형식:
\`\`\`sql
-- 쿼리 설명
SELECT ...
FROM ...
WHERE ...
LIMIT 1000;
\`\`\`

설명: 이 쿼리는 ...을 조회합니다.

**⚠️ 중요 제약 조건:**
- 위에 나열된 허용된 테이블만 사용 가능
- 존재하지 않거나 허용되지 않은 테이블 절대 사용 금지
- DROP, DELETE, INSERT, UPDATE 등 위험한 키워드 절대 사용 금지
- 복잡한 JOIN은 성능을 고려하여 단순화
- 날짜 컬럼 사용 시 적절한 형변환 적용
- 허용되지 않은 테이블 요청 시 "해당 테이블은 사용할 수 없습니다"라고 응답

**📝 컬럼명 작성 규칙**
- 모든 컬럼명은 반드시 쌍따옴표로 감싸기: "column_name", "userId", "createdAt"
- PostgreSQL은 대소문자를 구분하므로 정확한 케이스 필요
- 예약어 충돌 방지 및 특수문자 안전 처리
- 일관성 유지: SELECT "id", "name", "created_at" FROM table_name;`;

    } catch (error) {
      this.logger.error('시스템 프롬프트 구성 실패:', error);
      return '당신은 SQL 전문가입니다. 안전한 SELECT 쿼리만 생성해주세요.';
    }
  }

  private analyzeSqlFromResponse(content: string): SqlAnalysis {
    // SQL 코드 블록 추출 (```sql ... ```)
    const sqlMatch = content.match(/```sql\s*([\s\S]*?)\s*```/i);
    
    if (!sqlMatch) {
      return {
        isValidSql: false,
        confidence: 0,
        explanation: 'SQL 코드 블록을 찾을 수 없습니다.',
      };
    }

    const query = sqlMatch[1].trim();
    this.logger.debug(`추출된 쿼리: "${query}"`);
    
    // 주석 제거 후 첫 번째 SQL 문 찾기
    const lines = query.split('\n').map(line => line.trim());
    const sqlLines = lines.filter(line => line && !line.startsWith('--'));
    const actualQuery = sqlLines.join(' ').trim();
    
    this.logger.debug(`정제된 쿼리: "${actualQuery}"`);
    
    // 기본적인 SQL 검증
    const normalizedQuery = actualQuery.toLowerCase().replace(/\s+/g, ' ').trim();
    const isSelect = normalizedQuery.startsWith('select');
    const hasDangerousKeywords = /\b(drop|delete|insert|update|alter|truncate|exec|execute|create|grant|revoke)\b/i.test(normalizedQuery);
    
    const isValid = isSelect && !hasDangerousKeywords;
    
    this.logger.debug(`SQL 검증 결과: isSelect=${isSelect}, hasDangerous=${hasDangerousKeywords}, isValid=${isValid}`);
    
    return {
      isValidSql: isValid,
      query: isValid ? actualQuery : undefined,
      explanation: isValid 
        ? '유효한 SELECT 쿼리입니다.' 
        : isSelect 
          ? '위험한 키워드가 포함된 쿼리입니다.'
          : 'SELECT 문이 아닙니다.',
      confidence: isValid ? 0.9 : 0.1,
    };
  }
} 