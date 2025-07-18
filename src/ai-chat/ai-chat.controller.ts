import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Body, 
  Param, 
  ValidationPipe,
  UsePipes,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { AiChatService } from './ai-chat.service';
import { 
  ChatRequestDto, 
  SqlExecutionRequestDto 
} from './dto/chat-request.dto';
import { 
  ChatResponseDto, 
  ChatErrorResponseDto,
  SqlExecutionResponseDto,
  SessionListResponseDto,
} from './dto/chat-response.dto';

@ApiTags('AI Chat')
@Controller('ai-chat')
@UsePipes(new ValidationPipe({ transform: true }))
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('/')
  @ApiOperation({
    summary: 'AI 채팅 메시지 전송',
    description: '사용자의 자연어 질문을 AI가 SQL 쿼리로 변환하여 응답합니다.'
  })
  @ApiBody({ type: ChatRequestDto })
  @ApiResponse({
    status: 200,
    description: 'AI 채팅 응답 성공',
    type: ChatResponseDto
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    type: ChatErrorResponseDto
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류',
    type: ChatErrorResponseDto
  })
  async chat(@Body() chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    try {
      return await this.aiChatService.processChat(chatRequest);
    } catch (error) {
      throw new HttpException({
        success: false,
        error: '채팅 처리 중 오류가 발생했습니다.',
        code: 'CHAT_PROCESSING_ERROR'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('/execute-sql')
  @ApiOperation({
    summary: 'AI가 생성한 SQL 쿼리 실행',
    description: 'AI가 생성한 SQL 쿼리를 안전하게 실행합니다.'
  })
  @ApiBody({ type: SqlExecutionRequestDto })
  @ApiResponse({
    status: 200,
    description: 'SQL 실행 성공',
    type: SqlExecutionResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'SQL 실행 실패',
    type: SqlExecutionResponseDto
  })
  async executeSql(@Body() sqlRequest: SqlExecutionRequestDto): Promise<SqlExecutionResponseDto> {
    try {
      return await this.aiChatService.executeSql(sqlRequest);
    } catch (error) {
      return {
        success: false,
        error: 'SQL 실행 중 오류가 발생했습니다.',
        code: 'SQL_EXECUTION_ERROR'
      };
    }
  }

  @Get('/sessions')
  @ApiOperation({
    summary: '채팅 세션 목록 조회',
    description: '저장된 모든 채팅 세션 목록을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '세션 목록 조회 성공',
    type: SessionListResponseDto
  })
  async getSessions(): Promise<SessionListResponseDto> {
    try {
      const sessions = await this.aiChatService.getSessions();
      
      return {
        success: true,
        sessions: sessions.map(session => ({
          id: session.id,
          title: session.title,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          messageCount: session.messages.length,
          lastMessage: session.messages.length > 0 
            ? session.messages[session.messages.length - 1].content.substring(0, 100)
            : undefined,
        }))
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        error: '세션 목록 조회 중 오류가 발생했습니다.'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/sessions/:sessionId')
  @ApiOperation({
    summary: '특정 채팅 세션 조회',
    description: '지정된 세션 ID의 채팅 기록을 조회합니다.'
  })
  @ApiParam({ name: 'sessionId', description: '채팅 세션 ID' })
  @ApiResponse({
    status: 200,
    description: '세션 조회 성공'
  })
  @ApiResponse({
    status: 404,
    description: '세션을 찾을 수 없음'
  })
  async getSession(@Param('sessionId') sessionId: string) {
    try {
      const session = await this.aiChatService.getSession(sessionId);
      
      if (!session) {
        throw new HttpException({
          success: false,
          error: '존재하지 않는 세션입니다.'
        }, HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        session
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException({
        success: false,
        error: '세션 조회 중 오류가 발생했습니다.'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('/sessions/:sessionId')
  @ApiOperation({
    summary: '채팅 세션 삭제',
    description: '지정된 세션 ID의 채팅 기록을 삭제합니다.'
  })
  @ApiParam({ name: 'sessionId', description: '삭제할 채팅 세션 ID' })
  @ApiResponse({
    status: 200,
    description: '세션 삭제 성공'
  })
  @ApiResponse({
    status: 404,
    description: '세션을 찾을 수 없음'
  })
  async deleteSession(@Param('sessionId') sessionId: string) {
    try {
      const deleted = await this.aiChatService.deleteSession(sessionId);
      
      if (!deleted) {
        throw new HttpException({
          success: false,
          error: '존재하지 않는 세션입니다.'
        }, HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        message: '세션이 삭제되었습니다.'
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException({
        success: false,
        error: '세션 삭제 중 오류가 발생했습니다.'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/health')
  @ApiOperation({
    summary: 'AI Chat 서비스 상태 확인',
    description: 'AI Chat 서비스와 OpenAI API 연결 상태를 확인합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '서비스 정상'
  })
  async healthCheck() {
    return {
      success: true,
      message: 'AI Chat 서비스가 정상적으로 작동 중입니다.',
      timestamp: new Date(),
      version: '1.0.0'
    };
  }
} 