import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ValidateNested, IsNotEmpty, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ChatMessage } from '../interfaces/chat.interface';

export class ChatMessageDto {
  @ApiProperty({ description: '메시지 ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: '메시지 역할', enum: ['user', 'assistant', 'system'] })
  @IsString()
  role: 'user' | 'assistant' | 'system';

  @ApiProperty({ description: '메시지 내용', maxLength: 5000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000, { message: '메시지는 5000자를 초과할 수 없습니다.' })
  content: string;

  @ApiProperty({ description: '메시지 타임스탬프' })
  timestamp: Date;

  @ApiProperty({ description: 'AI가 생성한 SQL 쿼리', required: false })
  @IsOptional()
  @IsString()
  sqlQuery?: string;
}

export class ChatRequestDto {
  @ApiProperty({ 
    description: '사용자 메시지 내용',
    example: '최근 7일간 매출이 가장 높은 공연 3개를 보여주세요'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: '메시지는 1000자를 초과할 수 없습니다.' })
  message: string;

  @ApiProperty({ 
    description: '채팅 세션 ID (선택사항)', 
    required: false,
    example: 'session_123'
  })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({ 
    description: '이전 메시지 기록 (컨텍스트용)', 
    required: false,
    type: [ChatMessageDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  previousMessages?: ChatMessageDto[];
}

export class SqlExecutionRequestDto {
  @ApiProperty({ description: 'AI가 생성한 SQL 쿼리' })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiProperty({ description: '채팅 세션 ID' })
  @IsString()
  sessionId: string;

  @ApiProperty({ description: '메시지 ID' })
  @IsString()
  messageId: string;
} 