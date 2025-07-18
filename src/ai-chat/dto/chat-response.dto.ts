import { ApiProperty } from '@nestjs/swagger';
import { ChatMessage, SqlAnalysis } from '../interfaces/chat.interface';

export class ChatResponseDto {
  @ApiProperty({ description: '성공 여부' })
  success: boolean;

  @ApiProperty({ description: 'AI 응답 메시지' })
  message: ChatMessage;

  @ApiProperty({ description: '세션 ID' })
  sessionId: string;

  @ApiProperty({ description: 'SQL 분석 결과', required: false })
  sqlAnalysis?: SqlAnalysis;

  @ApiProperty({ description: '토큰 사용량', required: false })
  tokensUsed?: number;

  @ApiProperty({ description: '응답 시간 (밀리초)', required: false })
  responseTime?: number;
}

export class ChatErrorResponseDto {
  @ApiProperty({ description: '성공 여부', default: false })
  success: false;

  @ApiProperty({ description: '에러 메시지' })
  error: string;

  @ApiProperty({ description: '에러 코드', required: false })
  code?: string;

  @ApiProperty({ description: '세션 ID', required: false })
  sessionId?: string;
}

export class SqlExecutionResponseDto {
  @ApiProperty({ description: '성공 여부' })
  success: boolean;

  @ApiProperty({ description: 'SQL 실행 결과', required: false })
  results?: any[];

  @ApiProperty({ description: '실행 시간 (밀리초)', required: false })
  executionTime?: number;

  @ApiProperty({ description: '행 수', required: false })
  rowCount?: number;

  @ApiProperty({ description: '에러 메시지', required: false })
  error?: string;

  @ApiProperty({ description: '에러 코드', required: false })
  code?: string;
}

export class SessionListResponseDto {
  @ApiProperty({ description: '성공 여부' })
  success: boolean;

  @ApiProperty({ description: '채팅 세션 목록' })
  sessions: {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    messageCount: number;
    lastMessage?: string;
  }[];
} 